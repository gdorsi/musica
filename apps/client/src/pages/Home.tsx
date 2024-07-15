import { useState } from "react";

import { Input } from "../components/ui/input";
import { AddNewDevice } from "../components/recipes/add-new-device";
import { TrackList } from "../components/recipes/track-list";
import { NewPlaylistButton } from "../components/recipes/add-new-playlist";
import { usePlaylists } from "@/data/usePlaylists";
import { PlayerControls } from "../components/recipes/player-controls";
import { TrackDropArea } from "../components/recipes/track-drop-area";
import { TrackUploadButton } from "../components/recipes/track-upload-button";
import { useUser } from "@/auth/useUser";
import { ShowDeviceId } from "../components/recipes/show-device-id";
import { Sidebar } from "@/components/recipes/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { HiOutlineDotsVertical, HiX } from "react-icons/hi";
import { TbPlaylist } from "react-icons/tb";

export function Home() {
	const user = useUser();
	const trackId = user.rootDocument;

	const [filter, setFilter] = useState("");
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const { playlists } = usePlaylists();

	return (
		<div className="min-h-screen flex">
			<div
				className={`fixed inset-0 z-40 bg-white transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:bg-transparent lg:w-1/5 lg:w-1/6`}
			>
				<div className="flex justify-end lg:hidden p-4">
					<HiX
						className="text-2xl cursor-pointer"
						onClick={() => setIsSidebarOpen(false)}
					/>
				</div>
				<Sidebar playlists={playlists} />
			</div>
			<div className="flex-grow flex flex-col">
				<TrackDropArea className="flex-grow lg:border-l flex flex-col justify-between">
					<div className="h-full px-4 py-6 lg:px-8 overflow-auto">
						<div className="flex items-center justify-between mb-4">
							<div className="lg:hidden">
								<TbPlaylist
									className="text-2xl cursor-pointer"
									onClick={() => setIsSidebarOpen(!isSidebarOpen)}
								/>
							</div>
							<Input
								type="search"
								placeholder="Search by Name or Tag"
								className="flex-grow mr-4"
								onChange={(evt) => setFilter(evt.target.value)}
							/>
							<div className="hidden lg:flex items-center space-x-4">
								<TrackUploadButton />
								<AddNewDevice />
								<NewPlaylistButton />
								<ShowDeviceId />
							</div>
							<div className="lg:hidden">
								<DropdownMenu>
									<DropdownMenuTrigger>
										<HiOutlineDotsVertical className="text-2xl" />
									</DropdownMenuTrigger>
									<DropdownMenuContent className="bg-white border border-gray-200 rounded shadow-lg">
										<DropdownMenuItem className="p-2 hover:bg-gray-100 cursor-pointer text-black">
											<div className="flex items-center space-x-2">
												<TrackUploadButton />
											</div>
										</DropdownMenuItem>
										<DropdownMenuItem className="p-2 hover:bg-gray-100 cursor-pointer text-black">
											<div className="flex items-center space-x-2">
												<AddNewDevice />
											</div>
										</DropdownMenuItem>
										<DropdownMenuItem className="p-2 hover:bg-gray-100 cursor-pointer text-black">
											<div className="flex items-center space-x-2">
												<NewPlaylistButton />
											</div>
										</DropdownMenuItem>
										<DropdownMenuItem className="p-2 hover:bg-gray-100 cursor-pointer text-black">
											<div className="flex items-center space-x-2">
												<ShowDeviceId />
											</div>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
						<h2 className="text-3xl font-semibold tracking-tight mt-5">
							All Tracks
						</h2>
						<TrackList filter={filter} trackId={trackId} />
					</div>
					<PlayerControls trackId={trackId} />
				</TrackDropArea>
			</div>
		</div>
	);
}
