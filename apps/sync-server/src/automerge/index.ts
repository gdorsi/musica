import { DocumentId, Repo } from "@automerge/automerge-repo";
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
	async get(dir: string, repo: Repo, documentId: string) {
		if (!owenship.value[documentId]) {
			const doc = repo.find<{ owner: string }>(documentId as DocumentId);

			await doc.whenReady(["unavailable", "ready"]);

			if (doc.state === "ready") {
				const value = doc.docSync();

				console.log(value);
				if (value) {
					owenship.value[documentId] = value.owner;
				}
			} else {
				// The doc is not in the FS
				return undefined;
			}

			fs.writeFile(`${dir}/ownership.json`, JSON.stringify(owenship.value));
		}

		return owenship.value[documentId];
	},
};

export async function createAutomergeRepo({
	socket,
	dir,
}: AutomergeRepoParams) {
	await fs.mkdir(dir, { recursive: true });
	await owenship.load(dir);

	const accessControl = new AccessControlProvider({
		async validateDocumentAccess(message) {
			if (!message.documentId) return true;
			if (!message.Authorization) return false;

			const ownerDid = await owenship.get(dir, repo, message.documentId);

			// The document is not in the storagr
			// Let the user write
			if (!ownerDid) return true;

			const result = await validateUserAccess({
				auth: message.Authorization,
				permission: "write",
				resource: `automerge/${message.documentId}`,
				ownerDid,
			});

			return result.ok;
		},
	});

	const repo = new Repo({
		network: [accessControl.wrap(new NodeWSServerAdapter(socket))],
		storage: new NodeFSStorageAdapter(dir),
		peerId: await getServiceDid(),
		// Since this is a server, we don't share generously — meaning we only sync documents they already
		// know about and can ask for by ID.
		sharePolicy: async () => false,
	});
}
