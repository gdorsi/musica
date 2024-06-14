import { Repo } from "@automerge/automerge-repo";
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import type { Did } from "./data/schema";

export function createRepository(peerId: Did, syncServers: string[]) {
	const repo = new Repo({
		peerId,
		network: [
			...syncServers.map(
				(address) => new BrowserWebSocketClientAdapter(`ws://${address}/`),
			),
			new BroadcastChannelNetworkAdapter(),
		],
		storage: new IndexedDBStorageAdapter("automerge"),
	});

	return repo;
}
