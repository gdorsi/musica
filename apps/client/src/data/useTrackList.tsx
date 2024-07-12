import {
	useDocument,
	useDocuments,
} from "@automerge/automerge-repo-react-hooks";
import { AutomergeUrl, DocumentId } from "@automerge/automerge-repo";
import { useMusicCollection } from "@/data/useMusicCollection";

import { useMemo, useRef } from "react";
import { useMediaPlayer } from "@/audio/useMediaPlayer";
import { useActiveTrack } from "@/audio/ActiveTrackState";
import { usePlayState } from "@/audio/usePlayState";
import { MusicItem } from "@musica/shared/models/MusicItem";
import { Playlist } from "@musica/shared/models/Playlist";
import { RootDocument } from "@musica/shared/models/RootDocument";
import { mediaStorage } from "./storage/opfs";
import { promiseWithResolvers } from "@/utils";

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

	const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

	async function loadMediaItem(item: MusicItem) {
		clearTimeout(timeoutRef.current);
		if (item === activeTrack) {
			setLoading(false);
			return playState.toggle();
		}

		setLoading(true);
		setActiveTrack(item);

		while ((await mediaStorage.fileExist(item.file.id)) === false) {
			const wait = promiseWithResolvers();
			timeoutRef.current = setTimeout(wait.resolve, 1000);
			await wait.promise;
		}

		const file = await mediaStorage.getFile(item.file.id);
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
