import { useEffect, useRef, useState } from "react";
import { AudioManager } from "./AudioManager";

export type PlayState = "pause" | "play";

type MediaPlayerParams = {
	onMediaEnd?: () => void;
};

// Using a module instance to survive navigation
const audioManager = new AudioManager();

export function useMediaPlayer(params: MediaPlayerParams) {
	const [playState, setPlayState] = useState<PlayState>("pause");
	const [currentTime, setCurrentTime] = useState<number>(0);

	const previousMediaLoad = useRef<Promise<unknown>>();

	useEffect(() => {
		const onTimeUpdate = () => {
			setCurrentTime(audioManager.mediaElement.currentTime);
		};

		const onPlay = () => {
			setPlayState("play");
		};

		const onPause = () => {
			setPlayState("pause");
		};

		const onEnd = () => {
			setPlayState("pause");
			params.onMediaEnd?.();
		};

		audioManager.mediaElement.addEventListener("timeupdate", onTimeUpdate);
		audioManager.mediaElement.addEventListener("ended", onEnd);
		audioManager.mediaElement.addEventListener("play", onPlay);
		audioManager.mediaElement.addEventListener("pause", onPause);

		return () => {
			audioManager.mediaElement.removeEventListener("timeupdate", onTimeUpdate);
			audioManager.mediaElement.removeEventListener("ended", onEnd);
			audioManager.mediaElement.removeEventListener("play", onPlay);
			audioManager.mediaElement.removeEventListener("pause", onPause);
		};
	}, [params.onMediaEnd]);

	async function playMedia(file: File) {
		// Wait for the previous load to finish
		// to avoid to incur into concurrency issues
		await previousMediaLoad.current;

		const promise = audioManager.loadAudio(file);

		previousMediaLoad.current = promise;

		await promise;

		audioManager.play();
		setPlayState("play");
		setCurrentTime(0);
	}

	async function togglePlayState() {
		if (!previousMediaLoad.current) return;

		if (playState === "pause") {
			audioManager.play();
		} else {
			audioManager.pause();
		}
	}

	useEffect(() => {
		const handler = (evt: KeyboardEvent) => {
			if (evt.key === " " && evt.target === document.body) {
				evt.preventDefault();
				togglePlayState();
			}
		};

		document.body.addEventListener("keydown", handler);

		return () => {
			document.body.removeEventListener("keydown", handler);
		};
	});

	function seek(time: number) {
		if (playState !== "play") audioManager.play();

		audioManager.mediaElement.currentTime = time;
	}
	function setVolume(volume: number) {
		audioManager.mediaElement.volume = volume;
	}

	return {
		currentTime,
		setVolume,
		seek,
		playState,
		playMedia,
		togglePlayState,
	};
}

export type MediaPlayer = ReturnType<typeof useMediaPlayer>;
