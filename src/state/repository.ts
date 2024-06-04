import { Repo, isValidAutomergeUrl } from "@automerge/automerge-repo";
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";

function getOrCreateDocument<V>(
	repo: Repo,
	name: string,
	init: (d: V) => void = () => {},
) {
	const documentURL = localStorage.getItem(name);

	if (isValidAutomergeUrl(documentURL)) {
		const handle = repo.find<V>(documentURL);

		if (handle) {
			return documentURL;
		}
	}

	const handle = repo.create<V>();
	handle.change(init);

	localStorage.setItem(name, handle.url);

	return handle.url;
}

export type MusicCollectionItem = {
	fileName: string;
	title: string;
};

export type MusicCollectionDocument = { collection: MusicCollectionItem[] };

export function getDocumentsURLs(repo: Repo) {
	return {
		musicCollection: getOrCreateDocument<MusicCollectionDocument>(
			repo,
			"musicCollection",
			(d) => {
				d.collection = [];
			},
		),
	};
}

export type Documents = ReturnType<typeof getDocumentsURLs>;

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
