import { useRef, useState } from "react";
import { AudioManager } from "../lib/AudioManager";

export type PlayState = "pause" | "play";

export function useMediaPlayer() {
	const audioManagerRef = useRef<AudioManager | null>(null);

	const [playState, setPlayState] = useState<PlayState>("pause");

	const previousMediaLoad = useRef(Promise.resolve());

	function getAudioManager() {
		if (!audioManagerRef.current) {
			audioManagerRef.current = new AudioManager();
		}

		return audioManagerRef.current;
	}

	async function playMedia(file: File) {
		const audioManager = getAudioManager();

		// Wait for the previous load to finish
		// to avoid to incur into concurrency issues
		await previousMediaLoad.current;

		const promise = audioManager.loadAudio(file);
		previousMediaLoad.current = promise;

		await promise;

		audioManager.play();
		setPlayState("play");
	}

	async function togglePlayState() {
		const audioManager = getAudioManager();

		if (playState === "pause") {
			audioManager.play();
			setPlayState("play");
		} else {
			audioManager.pause();
			setPlayState("pause");
		}
	}

	return {
		playState,
		playMedia,
		togglePlayState,
	};
}
