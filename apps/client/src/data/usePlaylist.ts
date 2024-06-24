import { DocumentId } from "@automerge/automerge-repo";
import { useDocument, useRepo } from "@automerge/automerge-repo-react-hooks";
import { MusicItem, Playlist } from "./schema";

export function usePlaylist(documentId: string | undefined) {
	const repo = useRepo();

	const [playlist, change] = useDocument<Playlist>(documentId as DocumentId);

	function findDocumentId(item: MusicItem) {
		if (!playlist) return null;

		for (const documentId of playlist.tracks) {
			const handle = repo.find<MusicItem>(documentId);

			const doc = handle.docSync();

			if (doc?.id === item.id) {
				return documentId;
			}
		}

		return null;
	}

	function updateName(name: string) {
		change((doc) => {
			doc.name = name;
		});
	}

	function addTrack(documentId: DocumentId) {
		change((doc) => {
			doc.tracks.push(documentId);
		});
	}

	function removeTrack(item: MusicItem) {
		const documentId = findDocumentId(item);

		if (documentId === null) return;

		change((doc) => {
			const index = Array.from(doc.tracks).indexOf(documentId);

			if (index >= 0) {
				doc.tracks.splice(index, 1);
			}
		});
	}

	return {
		playlist,
		findDocumentId,
		updateName,
		addTrack,
		removeTrack,
	};
}

export type PlaylistApi = ReturnType<typeof usePlaylist>;
