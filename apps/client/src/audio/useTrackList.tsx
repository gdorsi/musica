import {
	useDocument,
	useDocuments,
} from "@automerge/automerge-repo-react-hooks";
import { getFile } from "@/storage/opfs";
import { AutomergeUrl, DocumentId } from "@automerge/automerge-repo";
import { MusicItem, Playlist, RootDocument } from "@/data/schema";
import { useMusicCollection } from "@/data/useMusicCollection";
import { usePlayState } from "./usePlayState";
import { useMediaPlayer } from "./useMediaPlayer";
import { useActiveTrack } from "./ActiveTrackState";
import { useMemo } from "react";

export function useTrackList(trackId: DocumentId | AutomergeUrl | undefined) {
	const [doc] = useDocument<Playlist | RootDocument>(trackId);

	const { activeTrack, loading, setActiveTrack, setLoading } = useActiveTrack();

	const tracksMap = useDocuments<MusicItem>(doc?.tracks);

	const tracks = useMemo(() => Object.values(tracksMap), [tracksMap]);

	function getNextSong() {
		const currentIndex = tracks.findIndex((item) => item === activeTrack);
		const nextIndex = (currentIndex + 1) % tracks.length;

		return tracks[nextIndex];
	}

	function getPrevSong() {
		const currentIndex = tracks.findIndex((item) => item === activeTrack);
		const previousIndex = (currentIndex - 1 + tracks.length) % tracks.length;
		return tracks[previousIndex];
	}

	const playState = usePlayState();
	const playMedia = useMediaPlayer();

	async function loadMediaItem(item: MusicItem) {
		if (item === activeTrack) {
			return playState.toggle();
		}

		setLoading(true);
		setActiveTrack(item);

		const file = await getFile(item.file.id);
		await playMedia(file);
		setLoading(false);
	}

	return {
		tracks,
		activeTrack,
		setActiveTrack: loadMediaItem,
		loading,
		getNextSong,
		getPrevSong,
	};
}

export type MusicCollectionApi = ReturnType<typeof useMusicCollection>;
