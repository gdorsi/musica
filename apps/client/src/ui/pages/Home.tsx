import { Button } from "../components/ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";

import { FaPause, FaPlay, FaStepBackward, FaStepForward } from "react-icons/fa";
import { useMusicCollection } from "@/data/useMusicCollection";
import type { MusicItem } from "@/data/schema";
import { Input } from "../components/ui/input";
import { useState } from "react";
import { AddNewDevice } from "../components/recipes/add-new-device";
import { useMusicCollectionMediaSync } from "@/data/useMusicCollectionMediaSync";
import { useMediaPlayer } from "@/audio/useMediaPlayer";
import { WaveForm } from "../components/recipes/waveform";
import { TrackList } from "../components/recipes/track-list";
import { FileDropArea } from "../components/ui/drop-area";

function App() {
	useMusicCollectionMediaSync();

	const musicCollection = useMusicCollection();
	const mediaPlayer = useMediaPlayer({
		onMediaEnd() {
			const next = musicCollection.getNextSong();

			if (next) {
				handleMediaSelect(next);
			}
		},
	});

	const [loading, setLoading] = useState(false);
	async function handleFileLoad(evt: React.ChangeEvent<HTMLInputElement>) {
		await musicCollection.addFilesToCollection(evt.target.files);

		evt.target.value = "";
	}

	async function handleMediaSelect(item: MusicItem) {
		if (item === musicCollection.activeMedia) {
			return mediaPlayer.togglePlayState();
		}

		setLoading(true);
		musicCollection.setActiveMedia(item);

		const file = await musicCollection.getMusicItemFile(item);
		await mediaPlayer.playMedia(file);
		setLoading(false);
	}

	function handleNext() {
		handleMediaSelect(musicCollection.getNextSong());
	}

	function handlePrevious() {
		handleMediaSelect(musicCollection.getPrevSong());
	}

	function handleVolumeChange(evt: React.ChangeEvent<HTMLInputElement>) {
		mediaPlayer.setVolume(evt.currentTarget.valueAsNumber);
	}

	const isPlaying = mediaPlayer.playState !== "pause" || loading;
	const noSongLoaded = !musicCollection.activeMedia;

	function handleMediaUpdate(item: MusicItem, patch: Partial<MusicItem>) {
		musicCollection.updateItem(item, patch);
	}

	const [filter, setFilter] = useState("");

	return (
		<div className="min-h-screen">
			<FileDropArea
				onDrop={musicCollection.addFilesToCollection}
				className="col-span-4 lg:border-l flex flex-col justify-between"
			>
				<div className="h-full px-4 py-6 lg:px-8 overflow-auto">
					<div className="flex items-center justify-between mb-4">
						<Input
							type="search"
							placeholder="Search by Name or Tag"
							className="flex-grow mr-4"
							onChange={(evt) => setFilter(evt.target.value)}
						/>
						<div className="flex items-center space-x-4">
							<Button
								asChild
								className="hover:cursor-pointer flex items-center"
							>
								<label className="flex items-center">
									<input
										type="file"
										onChange={handleFileLoad}
										multiple
										hidden
									/>
									<PlusCircledIcon className="mr-2 h-4 w-4" />
									Add Files
								</label>
							</Button>
							<AddNewDevice />
						</div>
					</div>
					<TrackList
						activeMedia={musicCollection.activeMedia}
						isPlaying={isPlaying}
						onMediaDelete={musicCollection.deleteItem}
						onMediaSelect={handleMediaSelect}
						onMediaUpdate={handleMediaUpdate}
						tracks={musicCollection.collection.filter((i) =>
							i.title.toLowerCase().includes(filter.toLowerCase()),
						)}
					/>
				</div>

				<div className="w-full flex flex-col items-center fixed bottom-0 left-0 p-3">
					{loading ? (
						<div className="w-8 h-8 border-t  border-black rounded-full animate-spin" />
					) : (
						musicCollection.activeMedia && (
							<WaveForm
								activeMedia={musicCollection.activeMedia}
								currentTime={mediaPlayer.currentTime}
								isPlaying={isPlaying}
								onSeek={mediaPlayer.seek}
								height={50}
							/>
						)
					)}
					<div className="flex items-center space-x-12 my-4">
						<button
							className="b-0"
							type="button"
							onClick={handlePrevious}
							disabled={!musicCollection.activeMedia}
						>
							<FaStepBackward
								size={40}
								className={` ${!musicCollection.activeMedia ? "text-gray-400" : "hover:cursor-pointer"}`}
							/>
						</button>
						<button
							className="b-0"
							type="button"
							onClick={mediaPlayer.togglePlayState}
							disabled={noSongLoaded}
						>
							{mediaPlayer.playState === "pause" ? (
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
			</FileDropArea>
		</div>
	);
}

export default App;
