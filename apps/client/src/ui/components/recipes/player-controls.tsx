import { FaPause, FaPlay, FaStepBackward, FaStepForward } from "react-icons/fa";
import { useMediaEndListener } from "@/audio/useMediaEndListener";
import { usePlayerVolume } from "@/audio/usePlayerVolume";
import { usePlayState } from "@/audio/usePlayState";
import { useTrackList } from "@/audio/useTrackList";
import { DocumentId } from "@automerge/automerge-repo";
import { WaveForm } from "./waveform";

export function PlayerControls(props: {
	trackId: DocumentId | undefined;
}) {
	const { activeTrack, getNextSong, getPrevSong, loading, setActiveTrack } =
		useTrackList(props.trackId);

	const noSongLoaded = !activeTrack;

	function handleNext() {
		setActiveTrack(getNextSong());
	}

	function handlePrevious() {
		setActiveTrack(getPrevSong());
	}

	const volume = usePlayerVolume();
	function handleVolumeChange(evt: React.ChangeEvent<HTMLInputElement>) {
		volume.setValue(evt.currentTarget.valueAsNumber);
	}

	const playState = usePlayState();

	useMediaEndListener(() => {
		const next = getNextSong();

		if (next) {
			setActiveTrack(next);
		}
	});

	return (
		<div className="w-full flex flex-col items-center fixed bottom-0 left-0 p-3">
			{loading ? (
				<div className="w-8 h-8 border-t  border-black rounded-full animate-spin" />
			) : (
				activeTrack && <WaveForm activeMedia={activeTrack} height={50} />
			)}
			<div className="flex items-center space-x-12 my-4">
				<button
					className="b-0"
					type="button"
					onClick={handlePrevious}
					disabled={!activeTrack}
				>
					<FaStepBackward
						size={40}
						className={` ${!activeTrack ? "text-gray-400" : "hover:cursor-pointer"}`}
					/>
				</button>
				<button
					className="b-0"
					type="button"
					onClick={playState.toggle}
					disabled={noSongLoaded}
				>
					{playState.value === "pause" ? (
						<FaPlay
							size={40}
							className={` ${noSongLoaded ? "text-gray-400" : "hover:cursor-pointer"}`}
						/>
					) : (
						<FaPause size={40} className="hover:cursor-pointer" />
					)}
				</button>
				<button
					className="b-0"
					type="button"
					onClick={handleNext}
					disabled={noSongLoaded}
				>
					<FaStepForward
						size={40}
						className={` ${noSongLoaded ? "text-gray-400" : "hover:cursor-pointer"}`}
					/>
				</button>
			</div>
			<div className="absolute left-2 -rotate-90 bottom-[34px]">
				<input
					type="range"
					min="0"
					max="1"
					step="0.01"
					defaultValue="1"
					onChange={handleVolumeChange}
					className="w-16 accent-black"
				/>
			</div>
		</div>
	);
}
