import { Repo } from "@automerge/automerge-repo";
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket";
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs";
import { ServerAccessControlProvider } from "@musica/automerge-helpers/lib/ServerAccessControlProvider";
import { getDocumentOwner } from "@musica/automerge-helpers/lib/getDocumentOwner";

// TODO: Decouple from node
import type { WebSocketServer } from "ws";
import { getServiceDid, validateUserAccess } from "../auth";

type AutomergeRepoParams = {
	socket: WebSocketServer;
	dir: string;
};

export async function createAutomergeRepo({
	socket,
	dir,
}: AutomergeRepoParams) {
	const accessControl = new ServerAccessControlProvider({
		async validateDocumentAccess(message, hasChanges) {
			if (!message.documentId) return true;
			if (!message.Authorization) return false;

			const ownerDid = await getDocumentOwner(repo, message.documentId);

			// The document either not in the storage or public
			if (!ownerDid) return true;

			const result = await validateUserAccess({
				auth: message.Authorization,
				permission: hasChanges ? "write" : "read",
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
