import { useEffect, useMemo, useRef, useState } from "react";
import { AudioManager } from "../lib/AudioManager";

export type PlayState = "pause" | "play";

export function useMediaPlayer() {
	const audioManager = useMemo(() => new AudioManager(), []);

	const [playState, setPlayState] = useState<PlayState>("pause");
	const [waveFormData, setWaveFormData] = useState<number[] | null>(null);
	const [currentTime, setCurrentTime] = useState<number>(0);
	const [duration, setDuration] = useState<number>(0);

	const previousMediaLoad = useRef<Promise<unknown>>(Promise.resolve());

	useEffect(() => {
		const onTimeUpdate = () => {
			setCurrentTime(audioManager.mediaElement.currentTime);
		};

		const onEnd = () => {
			setPlayState("pause");
		};

		audioManager.mediaElement.addEventListener("timeupdate", onTimeUpdate);
		audioManager.mediaElement.addEventListener("ended", onEnd);

		() => {
			audioManager.mediaElement.removeEventListener("timeupdate", onTimeUpdate);
			audioManager.mediaElement.removeEventListener("ended", onEnd);
		};
	}, [audioManager.mediaElement]);

	async function playMedia(file: File) {
		// Wait for the previous load to finish
		// to avoid to incur into concurrency issues
		await previousMediaLoad.current;

		const promise = Promise.all([
			audioManager.getWaveformData(file, 200).then(setWaveFormData),
			audioManager.loadAudio(file),
		]);

		previousMediaLoad.current = promise;

		await promise;

		audioManager.play();
		setPlayState("play");
		setDuration(audioManager.mediaElement.duration);
		setCurrentTime(0);
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

	function seek(time: number) {
		audioManager.mediaElement.currentTime = time;
	}

	return {
		currentTime,
		duration,
		seek,
		waveFormData,
		playState,
		playMedia,
		togglePlayState,
	};
}

export type MediaPlayer = ReturnType<typeof useMediaPlayer>;
