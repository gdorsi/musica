import { useMemo, useRef, useState } from "react";
import { AudioManager } from "../lib/AudioManager";

export type PlayState = "pause" | "play";

export function useMediaPlayer() {
	const audioManager = useMemo(() => new AudioManager(), []);

	const [currentMedia, setCurrentMedia] = useState<string>("");
	const [playState, setPlayState] = useState<PlayState>("pause");

	const previousMediaLoad = useRef(Promise.resolve());

	async function playMedia(fileName: string) {
		// Wait for the previous load to finish
		// to avoid to incur into concurrency issues
		await previousMediaLoad.current;

		const promise = audioManager.loadAudio(fileName);
		previousMediaLoad.current = promise;

		audioManager.play();
		setPlayState("play");
		setCurrentMedia(fileName);
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
