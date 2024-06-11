import { getFile } from "@/lib/filesystem";
import { useMediaPlayer } from "@/hooks/useMediaPlayer";
import { Button } from "../components/ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "../components/ui/carousel";
import { Card, CardContent } from "../components/ui/card";
import waveformPic from "@/ui/waveform.png";
import { FaPause, FaPlay } from "react-icons/fa";
import {
	useMusicCollection,
	useMusicCollectionMediaSync,
} from "../../state/musicCollection";
import type { MusicItem } from "@/state/schema";
import { WaveForm } from "../components/ui/waveform";

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
			<section className="w-full mt-0  bg-white flex flex-row   justify-between pt-0 pr-5 pb-5 border-b border-zinc-200">
				<div />
				<div className="text-xl font-semibold text-zinc-900">
					My collection:{" "}
				</div>
				<div className="">
					<Button className="hover:pointer">
						<label className="flex flex-row hover:pointer">
							<input type="file" onChange={handleFileLoad} multiple hidden />
							<PlusCircledIcon className="mr-2 h-4 w-4 hover:pointer" />
							add files
						</label>
					</Button>
				</div>
			</section>

			<div className=" flex flex-col items-center p-6">
				<Carousel className="w-full max-w-sm justify-between">
					<CarouselContent>
						{collection.map((item) => (
							<div key={item.id} className="flex flex-col items-center ">
								<CarouselItem className="md:basis-1/3 lg:basis-1/5 w-50">
									<label>
										<button
											type="button"
											onClick={() => handleMediaSelect(item)}
											disabled={item === activeMedia}
											hidden
										/>
										<Card className="h-40 w-[100px] hover:cursor-pointer">
											<CardContent className="flex aspect-square items-center justify-center p-0">
												<img
													src={waveformPic}
													alt="track"
													className="h-full w-full"
												/>
											</CardContent>
										</Card>
									</label>
								</CarouselItem>
								{item.title}
							</div>
						))}
					</CarouselContent>
					<CarouselPrevious />
					<CarouselNext />
				</Carousel>
			</div>

			<section className="w-full mt-0  flex flex-row   justify-between pt-6 border-t border-grey-200">
				<div />
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
							<FaPlay size={70} className="hover:cursor-pointer" />
						) : (
							<FaPause size={70} className="hover:cursor-pointer" />
						)}
					</div>
				</label>
				<div />
			</section>
			<WaveForm mediaPlayer={mediaPlayer} height={50} />
		</>
	);
}

export default App;
