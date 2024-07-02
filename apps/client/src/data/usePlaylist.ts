import { DocumentId } from "@automerge/automerge-repo";
import { useDocument, useRepo } from "@automerge/automerge-repo-react-hooks";
import {
	Playlist,
	addTrackToPlaylist,
	findTrackDocumentId,
	removeTrackFromPlaylist,
	updatePlaylistName,
} from "./models/Playlist";
import { isValidDocumentId } from "@automerge/automerge-repo/dist/AutomergeUrl";
import { MusicItem } from "./models/MusicItem";

export function usePlaylist(documentId: string | undefined) {
	const repo = useRepo();

	const playlistId =
		documentId && isValidDocumentId(documentId) ? documentId : undefined;

	const [playlist] = useDocument<Playlist>(playlistId);

	function findDocumentId(item: MusicItem) {
		if (!playlistId) return null;

		const trackId = findTrackDocumentId(repo, playlistId, item);

		return trackId ?? null;
	}

	function updateName(name: string) {
		if (!playlistId) return;

		updatePlaylistName(repo, playlistId, name);
	}

	function addTrack(trackId: DocumentId) {
		if (!playlistId) return;

		addTrackToPlaylist(repo, playlistId, trackId);
	}

	function removeTrack(item: MusicItem) {
		if (!playlistId) return;

		removeTrackFromPlaylist(repo, playlistId, item);
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
