import { Message, NetworkAdapter, Repo } from "@automerge/automerge-repo";
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { getResourceDelegation } from "./auth/permissions";
import { getSyncServerDid } from "./auth/auth";
import { User } from "./data/schema";

export function createRepository(userId: User["id"], syncServers: string[]) {
	const networkAdapters: NetworkAdapter[] = [
		new BroadcastChannelNetworkAdapter(),
	];

	for (const syncServer of syncServers) {
		const accessDataProvider = new AccessDataProvider({
			async addAuthData(message) {
				if (message.documentId) {
					const did = await getSyncServerDid(syncServer);

					const auth = await getResourceDelegation(
						userId,
						did,
						`automerge/${message.documentId}`,
					);

					return {
						...message,
						Authorization: auth,
					};
				}

				return message;
			},
		});

		networkAdapters.push(
			accessDataProvider.wrap(
				new BrowserWebSocketClientAdapter(`ws://${syncServer}/`),
			),
		);
	}

	const repo = new Repo({
		peerId: userId,
		network: networkAdapters,
		storage: new IndexedDBStorageAdapter("automerge"),
	});

	return repo;
}

type AccessDataProviderOptions = {
	addAuthData(message: Message): Promise<Message & { Authorization?: string }>;
};

export class AccessDataProvider {
	#options: AccessDataProviderOptions;

	constructor(options: AccessDataProviderOptions) {
		this.#options = options;
	}

	wrap(baseAdapter: NetworkAdapter) {
		const originalSend = baseAdapter.send;

		const { addAuthData } = this.#options;

		async function send(message: Message) {
			if (message.type === "sync" || message.type === "request") {
				originalSend.call(baseAdapter, await addAuthData(message));
			} else {
				originalSend.call(baseAdapter, message);
			}
		}

		baseAdapter.send = send;

		return baseAdapter;
	}
}
