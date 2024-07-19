import { useDocuments } from "@automerge/automerge-repo-react-hooks";
import { useMusicCollection } from "@/data/useMusicCollection";

import { useEffect, useMemo } from "react";
import { usePlayMedia } from "@/audio/usePlayMedia";
import { useActiveTrack } from "@/audio/ActiveTrackState";
import { usePlayState } from "@/audio/usePlayState";
import { MusicItem } from "@musica/shared/models/MusicItem";
import { promiseWithResolvers } from "@/utils";
import { mediaStorage } from "@/data/storage/opfs";

export function useMediaPlayer() {
	const { activeTrack, loading, setActiveTrack, setLoading, activePlaylist } =
		useActiveTrack();

	const tracksMap = useDocuments<MusicItem>(activePlaylist?.tracks);

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
	const playMedia = usePlayMedia();

	// biome-ignore lint/correctness/useExhaustiveDependencies: Triggers when the activeTrack changes
	useEffect(() => {
		if (!activeTrack) return;
		if (playState.value !== "play") return;

		let timeout: ReturnType<typeof setTimeout> | undefined = undefined;

		async function play(activeTrack: MusicItem) {
			setLoading(true);

			while ((await mediaStorage.fileExist(activeTrack.file.id)) === false) {
				const wait = promiseWithResolvers();
				timeout = setTimeout(wait.resolve, 1000);
				await wait.promise;
			}

			const file = await mediaStorage.getFile(activeTrack.file.id);
			await playMedia(file);
			setLoading(false);
		}

		play(activeTrack);

		return () => {
			clearTimeout(timeout);
		};
	}, [activeTrack, playState.value]);

	function playNextSong() {
		setActiveTrack(getNextSong());
	}

	function playPrevSong() {
		setActiveTrack(getPrevSong());
	}

	return {
		tracks,
		activeTrack,
		setActiveTrack,
		loading,
		playNextSong,
		playPrevSong,
	};
}

export type MusicCollectionApi = ReturnType<typeof useMusicCollection>;
