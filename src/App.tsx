import { useDocument } from "@automerge/automerge-repo-react-hooks";
import type { Documents, MusicCollectionDocument } from "./state/repository";
import { copyToPrivateFileSystem } from "./lib/filesystem";
import { useMediaPlayer } from "./hooks/useMediaPlayer";
import { Button } from "./ui/components/ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "./ui/components/ui/carousel";
import { Card, CardContent } from "./ui/components/ui/card";
import waveform from "@/ui/waveform.png";
import { FaPause, FaPlay } from "react-icons/fa";
function App(props: { documents: Documents }) {
	const mediaPlayer = useMediaPlayer();
	const [doc, change] = useDocument<MusicCollectionDocument>(
		props.documents.musicCollection,
	);

	async function handleFileLoad(evt: React.ChangeEvent<HTMLInputElement>) {
		const files = await copyToPrivateFileSystem(evt.target);

		evt.target.value = "";

		if (!files.length) return;

		change(({ collection }) => {
			for (const file of files) {
				if (collection.some((item) => item.fileName === file.name)) {
					continue;
				}

				collection.push({
					fileName: file.name,
					// Remove the file extension on the title
					title: file.name.replace(/\..+?$/, ""),
				});
			}
		});
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
						{doc?.collection.map((item) => (
							<div key={item.fileName} className="flex flex-col items-center ">
								<CarouselItem className="md:basis-1/3 lg:basis-1/5 w-50">
									<label>
										<button
											type="button"
											key={item.fileName}
											onClick={() => mediaPlayer.playMedia(item.fileName)}
											disabled={item.fileName === mediaPlayer.currentMedia}
											hidden
										/>
										<Card className="h-40 w-[100px] hover:cursor-pointer">
											<CardContent className="flex aspect-square items-center justify-center p-0">
												<img
													src={waveform}
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
						disabled={!mediaPlayer.currentMedia}
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
		</>
	);
}

export default App;
