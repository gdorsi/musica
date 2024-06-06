import { Repo } from "@automerge/automerge-repo";
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";

export function createRepository() {
	const repo = new Repo({
		network: [
			new BrowserWebSocketClientAdapter("wss://sync.automerge.org"),
			new BroadcastChannelNetworkAdapter(),
		],
		storage: new IndexedDBStorageAdapter("automerge"),
	});

	return {
		repo,
	};
}
