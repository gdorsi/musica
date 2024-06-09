import { Repo } from "@automerge/automerge-repo";
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket";
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs";

// TODO: Decouple from node
import fs from "node:fs/promises";
import os from "node:os";
import type { WebSocketServer } from "ws";

type AutomergeRepoParams = {
	socket: WebSocketServer;
};

export async function createAutomergeRepo({ socket }: AutomergeRepoParams) {
	const dir = "automerge-sync-server-data";

	await fs.mkdir(dir, { recursive: true });

	return new Repo({
		network: [new NodeWSServerAdapter(socket)],
		storage: new NodeFSStorageAdapter(dir),
		/** @ts-ignore @type {(import("@automerge/automerge-repo").PeerId)}  */
		peerId: `storage-server-${os.hostname()}`, // TODO: generate UCAN keychain and used did as peerId
		// Since this is a server, we don't share generously — meaning we only sync documents they already
		// know about and can ask for by ID.
		sharePolicy: async () => false,
	});
}
