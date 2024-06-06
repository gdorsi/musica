import { useMemo, useRef, useState } from "react";
import type { Doc } from "use-fireproof";
import { AudioManager } from "../lib/AudioManager";
import {
	type MusicCollectionItem,
	getMediaFile,
} from "../state/musicCollection";

export type PlayState = "pause" | "play";

export function useMediaPlayer() {
	const audioManager = useMemo(() => new AudioManager(), []);

	const [currentMedia, setCurrentMedia] = useState<string>("");
	const [playState, setPlayState] = useState<PlayState>("pause");

	const previousMediaLoad = useRef(Promise.resolve());

	async function playMedia(item: Doc<MusicCollectionItem>) {
		// Wait for the previous load to finish
		// to avoid to incur into concurrency issues
		await previousMediaLoad.current;

		const file = await getMediaFile(item);

		if (!file) return;

		const promise = audioManager.loadAudio(file);
		previousMediaLoad.current = promise;

		await promise;

		audioManager.play();
		setPlayState("play");
		setCurrentMedia(item._id);
	}

	async function togglePlayState() {
		if (playState === "pause") {
			audioManager.play();
			setPlayState("play");
		} else {
			audioManager.pause();
			setPlayState("pause");
		}
	}

	return {
		currentMedia,
		playState,
		playMedia,
		togglePlayState,
	};
}
