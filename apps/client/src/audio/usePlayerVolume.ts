import { useEffect, useState } from "react";
import { useAudioManager } from "./AudioManager";

export function usePlayerVolume() {
	const audioManager = useAudioManager();
	const [value, setValue] = useState<number>(0);

	useEffect(() => {
		setValue(audioManager.mediaElement.volume);

		const onVolumeChange = () => {
			setValue(audioManager.mediaElement.currentTime);
		};

		audioManager.mediaElement.addEventListener("volumechange", onVolumeChange);

		return () => {
			audioManager.mediaElement.removeEventListener(
				"timeupdate",
				onVolumeChange,
			);
		};
	}, [audioManager]);

	function setVolume(volume: number) {
		audioManager.mediaElement.volume = volume;
	}

	return {
		value,
		setValue: setVolume,
	};
}
