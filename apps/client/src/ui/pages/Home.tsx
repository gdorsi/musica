import { Button } from "../components/ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";

import { MdDelete } from "react-icons/md";

import {
	FaPause,
	FaPlay,
	FaPlayCircle,
	FaStepBackward,
	FaStepForward,
	FaVolumeUp,
} from "react-icons/fa";
import { useMusicCollection } from "@/data/useMusicCollection";
import type { MusicItem } from "@/data/schema";
import { Separator } from "@radix-ui/react-separator";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "../components/ui/table";
import { useState } from "react";
import { AddNewDevice } from "../components/recipes/add-new-device";
import { cn } from "../utils";
import { useMusicCollectionMediaSync } from "@/data/useMusicCollectionMediaSync";
import { useMediaPlayer } from "@/audio/useMediaPlayer";
import { Sidebar } from "../components/recipes/sidebar";
import { WaveForm } from "../components/recipes/waveform";

function App() {
	useMusicCollectionMediaSync();

	const mediaPlayer = useMediaPlayer();
	const musicCollection = useMusicCollection();
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

	function handleVolumeChange(event: React.ChangeEvent<HTMLInputElement>) {
		mediaPlayer.setVolume(event.currentTarget.valueAsNumber);
	}

	function handleDelete(event: React.MouseEvent<HTMLButtonElement>) {
		event.stopPropagation();

		alert("Delete not implemented yet!");
	}

	const isPlaying = mediaPlayer.playState !== "pause" || loading;
	const noSongLoaded = !musicCollection.activeMedia;

	return (
		<>
			<div className="grid lg:grid-cols-5 min-h-screen">
				<Sidebar />
				<div className="col-span-3 lg:col-span-4 lg:border-l flex flex-col justify-between">
					<div className="h-full px-4 py-6 lg:px-8 overflow-auto">
						<div className="flex items-center justify-between mb-4">
							<Input
								type="search"
								placeholder="Search by Name or Tag"
								className="flex-grow mr-4"
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
						<h2 className="text-2xl font-semibold tracking-tight mt-5">
							Tracks
						</h2>
						<Separator className="my-4" />
						<div>
							<Table>
								<TableBody>
									{musicCollection.collection.map((item, i) => {
										const isCurrentActiveMedia =
											item === musicCollection.activeMedia;
										return (
											<TableRow
												key={item.id}
												onClick={() => handleMediaSelect(item)}
												className={cn(
													"group hover:bg-gray-100",
													!isCurrentActiveMedia
														? " text-gray-600"
														: "bg-gray-200 text-black",
												)}
											>
												<TableCell className="w-1">
													<div className="h-full grid items-center text-center w-[30px]">
														<span
															className={cn(
																!isCurrentActiveMedia
																	? "group-hover:hidden"
																	: "hidden",
																"font-bold",
															)}
														>
															{i}
														</span>
														<button
															type="button"
															className={cn(
																!isCurrentActiveMedia &&
																	"hidden group-hover:block",
																"border-none ",
															)}
														>
															{isCurrentActiveMedia && isPlaying ? (
																<FaPause size={30} />
															) : (
																<FaPlayCircle size={30} />
															)}
														</button>
													</div>
												</TableCell>
												<TableCell className="w-12">
													<img
														src="https://placehold.co/512x512"
														alt={`${item.title} cover`}
														className="w-full h-auto"
													/>
												</TableCell>
												<TableCell className="font-medium">
													{item.title}
												</TableCell>
												<TableCell className="w-[30px]">
													{isCurrentActiveMedia && (
														<div>
															{Math.ceil(mediaPlayer.duration / 60)}:
															{Math.ceil(mediaPlayer.duration % 60)}
														</div>
													)}
												</TableCell>
												<TableCell className="w-[50px]">
													<button
														type="button"
														onClick={handleDelete}
														className="w-[30px] hidden group-hover:grid h-full items-center border-none"
													>
														<MdDelete size={30} />
													</button>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					</div>

					<div className="w-full border-t border-gray-200 bg-white flex flex-col items-center fixed bottom-0 left-0 lg:right-[20%] pt-6">
						{loading ? (
							<div className="w-8 h-8 border-t  border-black rounded-full animate-spin" />
						) : (
							<WaveForm mediaPlayer={mediaPlayer} height={50} />
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
						<div className="flex items-center space-x-4 mb-4">
							<FaVolumeUp size={20} />
							<input
								type="range"
								min="0"
								max="1"
								step="0.01"
								defaultValue="1"
								onChange={handleVolumeChange}
								className="w-32 accent-black"
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default App;
