import {
	NetworkAdapter,
	PeerId,
	PeerMetadata,
	cbor,
} from "@automerge/automerge-repo";
import {
	FromClientMessage,
	FromServerMessage,
	ProtocolVersion,
} from "@automerge/automerge-repo-network-websocket";
import {
	isJoinMessage,
	isLeaveMessage,
} from "@automerge/automerge-repo-network-websocket/dist/messages";

const ProtocolV1 = "1";

const toArrayBuffer = (bytes: Uint8Array) => {
	const { buffer, byteOffset, byteLength } = bytes;
	return buffer.slice(byteOffset, byteOffset + byteLength);
};
const { encode, decode } = cbor;

export class DurableObjectAutomergeWsAdapter extends NetworkAdapter {
	sockets: { [peerId: PeerId]: WebSocket } = {};

	connect(peerId: PeerId, peerMetadata?: PeerMetadata) {
		this.peerId = peerId;
		this.peerMetadata = peerMetadata;
	}

	disconnect() {}

	send(message: FromServerMessage) {
		if ("data" in message && message.data?.byteLength === 0)
			throw new Error("Tried to send a zero-length message");

		const socket = this.sockets[message.targetId];

		if (!socket) {
			return;
		}

		const encoded = encode(message);
		const arrayBuf = toArrayBuffer(encoded);

		socket.send(arrayBuf);
	}

	receiveMessage(messageBytes: Uint8Array, socket: WebSocket) {
		this.emit("ready", { network: this });

		const message: FromClientMessage = decode(messageBytes);

		const { senderId } = message;

		if (!this.peerId) return;

		if (isJoinMessage(message)) {
			const { peerMetadata, supportedProtocolVersions } = message;
			const existingSocket = this.sockets[senderId];

			if (existingSocket) {
				if (existingSocket.readyState === WebSocket.OPEN) {
					existingSocket.close();
				}
				this.emit("peer-disconnected", { peerId: senderId });
			}

			// Let the repo know that we have a new connection.
			this.emit("peer-candidate", { peerId: senderId, peerMetadata });
			this.sockets[senderId] = socket;

			const selectedProtocolVersion = selectProtocol(supportedProtocolVersions);
			if (selectedProtocolVersion === null) {
				this.send({
					type: "error",
					senderId: this.peerId,
					message: "unsupported protocol version",
					targetId: senderId,
				});
				this.sockets[senderId].close();
				delete this.sockets[senderId];
			} else {
				this.send({
					type: "peer",
					senderId: this.peerId,
					peerMetadata: this.peerMetadata,
					selectedProtocolVersion: ProtocolV1,
					targetId: senderId,
				});
			}
		} else if (isLeaveMessage(message)) {
			const { senderId } = message;
			const socket = this.sockets[senderId];
			/* c8 ignore next */
			if (!socket) return;
			this.#terminate(socket as WebSocketWithIsAlive);
		} else {
			this.emit("message", message);
		}
	}

	#terminate(socket: WebSocket) {
		this.removeSocket(socket);
		socket.close();
	}

	removeSocket(socket: WebSocket) {
		const peerId = this.#peerIdBySocket(socket);
		if (!peerId) return;
		this.emit("peer-disconnected", { peerId });
		delete this.sockets[peerId as PeerId];
	}

	#peerIdBySocket = (socket: WebSocket) => {
		const isThisSocket = (peerId: string) =>
			this.sockets[peerId as PeerId] === socket;
		const result = Object.keys(this.sockets).find(isThisSocket) as PeerId;
		return result ?? null;
	};
}

const selectProtocol = (versions?: ProtocolVersion[]) => {
	if (versions === undefined) return "1";
	if (versions.includes("1")) return "1";
	return null;
};

interface WebSocketWithIsAlive extends WebSocket {
	isAlive: boolean;
}
