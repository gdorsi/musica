import { getFile } from "@/lib/filesystem";
import { useMediaPlayer } from "@/hooks/useMediaPlayer";
import { Button } from "../components/ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";

import { Card, CardContent } from "../components/ui/card";
import waveformPic from "@/ui/waveform.png";
import { MdDelete } from "react-icons/md";

import { FaPause, FaPlay, FaPlayCircle } from "react-icons/fa";
import {
	useMusicCollection,
	useMusicCollectionMediaSync,
} from "../../state/musicCollection";
import type { MusicItem } from "@/state/schema";
import { WaveForm } from "../components/ui/waveform";
import { Sidebar } from "../components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "../components/ui/table";

function App() {
	useMusicCollectionMediaSync();

	const mediaPlayer = useMediaPlayer();
	const { addFilesToCollection, collection, activeMedia, setActiveMedia } =
		useMusicCollection();

	async function handleFileLoad(evt: React.ChangeEvent<HTMLInputElement>) {
		await addFilesToCollection(evt.target.files);

		evt.target.value = "";
	}

	async function handleMediaSelect(item: MusicItem) {
		setActiveMedia(item);

		const file = await getFile(item.file.id);
		await mediaPlayer.playMedia(file);
	}

	return (
		<>
			<div className="grid lg:grid-cols-5">
				<Sidebar />
				<div className="col-span-3 lg:col-span-4 lg:border-l">
					<div className="h-full px-4 py-6 lg:px-8">
						<div className="space-between flex items-center">
							<div>
								<Input type="search" placeholder="Search by Name or Tag" />
							</div>
							<div className="ml-auto mr-4 gap-6 flex items-center">
								<Button className="hover:cursor-pointer">
									<label className="flex flex-row hover:pointer">
										<input
											type="file"
											onChange={handleFileLoad}
											multiple
											hidden
										/>
										<PlusCircledIcon className="mr-2 h-4 w-4 hover:pointer" />
										add files
									</label>
								</Button>

								<Button className="hover:pointer">
									<PlusCircledIcon className="mr-2 h-4 w-4 hover:pointer" />
									New Playlist
								</Button>
							</div>
						</div>
						<div className="border-none p-0 outline-none">
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-semibold tracking-tight mt-5">
									Tracks
								</h2>
							</div>
							<Separator className="my-4 text-black	" />
							<div className=" ">
								<Table className="">
									<TableBody>
										{collection.map((item) => (
											<TableRow key={item.id} className="h-5">
												<TableCell className="font-medium">pic</TableCell>
												<TableCell className="font-medium">
													{item.title}
												</TableCell>
												<TableCell>
													<label>
														<button
															type="button"
															onClick={() => handleMediaSelect(item)}
															disabled={item === activeMedia}
															hidden
														/>
														<FaPlayCircle
															size={30}
															className="hover:cursor-pointer"
														/>
													</label>
												</TableCell>
												<TableCell className="text-right">
													<MdDelete size={30} />
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</div>

						<div className="w-full  h-20 pt-6 border-t border-grey-200 sticky bottom-0">
							<div>
								<WaveForm mediaPlayer={mediaPlayer} height={50} />
							</div>
							<label>
								<button
									className="b-0  "
									type="button"
									onClick={mediaPlayer.togglePlayState}
									disabled={!activeMedia}
									hidden
								/>
								<div>
									{mediaPlayer.playState === "pause" ? (
										<FaPlay
											size={60}
											className="hover:cursor-pointer mt-10 ml-5"
										/>
									) : (
										<FaPause
											size={60}
											className="hover:cursor-pointer mt-10 ml-5"
										/>
									)}
								</div>
							</label>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default App;
