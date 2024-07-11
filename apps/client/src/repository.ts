import { NetworkAdapter, Repo } from "@automerge/automerge-repo";
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { getResourceDelegation } from "./auth/permissions";
import { getSyncServerDid } from "./auth/auth";
import { ClientAccessControlProvider } from "@musica/shared/automerge/ClientAccessControlProvider";
import { User } from "@musica/shared/models/User";

export function createRepository(userId: User["id"], syncServers: string[]) {
	const networkAdapters: NetworkAdapter[] = [
		new BroadcastChannelNetworkAdapter(),
	];

	for (const syncServer of syncServers) {
		const accessDataProvider = new ClientAccessControlProvider({
			async addAuthData(message, hasChanges) {
				if (message.documentId) {
					const did = await getSyncServerDid(syncServer);

					const auth = await getResourceDelegation(
						userId,
						did,
						message.documentId,
						hasChanges ? "write" : "read",
					);

					return {
						...message,
						Authorization: auth,
					};
				}

				return message;
			},
		});

		const protocol = location.protocol === "https" ? "wss" : "ws";

		networkAdapters.push(
			accessDataProvider.wrap(
				new BrowserWebSocketClientAdapter(`${protocol}://${syncServer}/`),
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
