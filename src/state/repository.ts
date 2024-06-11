import { Repo } from "@automerge/automerge-repo";
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import type { Did } from "./schema";

export function createRepository(peerId: Did) {
	const repo = new Repo({
		peerId,
		network: [
			new BrowserWebSocketClientAdapter("wss://sync.automerge.org"),
			new BroadcastChannelNetworkAdapter(),
		],
		storage: new IndexedDBStorageAdapter("automerge"),
	});

	return repo;
}
