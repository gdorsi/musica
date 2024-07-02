import {
	useDocument,
	useDocuments,
} from "@automerge/automerge-repo-react-hooks";
import { getFile } from "./storage/opfs";
import { AutomergeUrl, DocumentId } from "@automerge/automerge-repo";
import { useMusicCollection } from "@/data/useMusicCollection";

import { useMemo } from "react";
import { useMediaPlayer } from "@/audio/useMediaPlayer";
import { useActiveTrack } from "@/audio/ActiveTrackState";
import { usePlayState } from "@/audio/usePlayState";
import { MusicItem } from "./models/MusicItem";
import { Playlist } from "./models/Playlist";
import { RootDocument } from "./models/RootDocument";

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
