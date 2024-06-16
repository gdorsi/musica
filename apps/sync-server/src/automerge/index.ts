import { Repo } from "@automerge/automerge-repo";
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket";
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs";

// TODO: Decouple from node
import fs from "node:fs/promises";
import type { WebSocketServer } from "ws";
import { AccessControlProvider } from "./AccessControlProvider";
import { getServiceDid, validateUserAccess } from "../auth";

type AutomergeRepoParams = {
	socket: WebSocketServer;
	dir: string;
};

// TODO: This is a mock ownership system, implement a proper one
export const owenship = {
	value: {} as Record<string, string>,
	async load(dir: string) {
		try {
			const value = JSON.parse(
				await fs.readFile(`${dir}/ownership.json`, "utf-8"),
			);

			Object.assign(owenship.value, value);
		} catch (err) {}
	},
	claim(dir: string, user: string, documentId: string) {
		if (owenship.value[documentId]) return;

		owenship.value[documentId] = user;

		fs.writeFile(`${dir}/ownership.json`, JSON.stringify(owenship.value));
	},
	get(documentId: string) {
		return owenship.value[documentId];
	},
};

export async function createAutomergeRepo({
	socket,
	dir,
}: AutomergeRepoParams) {
	await fs.mkdir(dir, { recursive: true });

	const accessControl = new AccessControlProvider({
		async validateDocumentAccess(message) {
			if (!message.documentId) return true;
			if (!message.Authorization) return false;

			// If not claimed, claim the ownership of the document

			owenship.claim(dir, message.senderId, message.documentId);

			const result = await validateUserAccess({
				auth: message.Authorization,
				permission: "write",
				resource: `automerge/${message.documentId}`,
				ownerDid: owenship.get(message.documentId),
			});

			return result.ok;
		},
	});

	return new Repo({
		network: [accessControl.wrap(new NodeWSServerAdapter(socket))],
		storage: new NodeFSStorageAdapter(dir),
		peerId: await getServiceDid(),
		// Since this is a server, we don't share generously — meaning we only sync documents they already
		// know about and can ask for by ID.
		sharePolicy: async () => false,
	});
}
