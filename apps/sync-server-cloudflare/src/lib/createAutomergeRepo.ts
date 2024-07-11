import { PeerId, Repo } from "@automerge/automerge-repo";
import { ServerAccessControlProvider } from "@musica/shared/automerge/ServerAccessControlProvider";
import { getDocumentOwner } from "@musica/shared/automerge/getDocumentOwner";
import { validateDocumentAccess } from "@musica/shared/sync-server/auth";

import { DurableObjectAutomergeStorageAdapter } from "./DurableObjectAutomergeStorageAdapter";
import { DurableObjectAutomergeWsAdapter } from "./DurableObjectAutomergeWsAdapter";

type AutomergeRepoParams = {
	storage: DurableObjectStorage;
};

export function createAutomergeRepo({ storage }: AutomergeRepoParams) {
	const accessControl = new ServerAccessControlProvider({
		async validateDocumentAccess(message, hasChanges) {
			if (!message.documentId) return true;
			if (!message.Authorization) return false;

			const ownerDid = await getDocumentOwner(repo, message.documentId);

			// The document either not in the storage or public
			if (!ownerDid) return true;

			const result = await validateDocumentAccess({
				auth: message.Authorization,
				permission: hasChanges ? "write" : "read",
				documentId: message.documentId,
				ownerDid,
				repo,
			});

			return result.ok;
		},
	});

	const network = accessControl.wrap(new DurableObjectAutomergeWsAdapter());

	const repo = new Repo({
		network: [network],
		storage: new DurableObjectAutomergeStorageAdapter(storage),
		peerId: "cloudflare-automerge-repo" as PeerId,
		// Since this is a server, we don't share generously — meaning we only sync documents they already
		// know about and can ask for by ID.
		sharePolicy: async () => false,
	});

	return { repo, network };
}
