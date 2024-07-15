import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { usePlaylist } from "@/data/usePlaylist";
import { useParams } from "react-router-dom";
import { PlayerControls } from "../components/recipes/player-controls";
import { TrackDropArea } from "../components/recipes/track-drop-area";
import { TrackList } from "../components/recipes/track-list";
import { Input } from "../components/ui/input";
import { DocumentIdSchema } from "@musica/shared/schema";
import { SharePlaylist } from "../components/recipes/share-playlist";
import { Sidebar } from "@/components/recipes/sidebar";
import { usePlaylists } from "@/data/usePlaylists";
import { HiOutlineDotsVertical, HiX } from "react-icons/hi";
import { TbPlaylist } from "react-icons/tb";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export function Playlist() {
	const params = useParams<"documentId">();
	const { playlist: initialPlaylist, updateName } = usePlaylist(
		params.documentId,
	);

	const [playlistName, setPlaylistName] = useState(initialPlaylist?.name || "");
	const [isNameEmpty, setIsNameEmpty] = useState(false);

	useEffect(() => {
		setPlaylistName(initialPlaylist?.name || "");
		setIsNameEmpty(false);
	}, [initialPlaylist]);

	const trackId = useMemo(
		() => DocumentIdSchema.parse(params.documentId),
		[params.documentId],
	);
	const { playlists } = usePlaylists();
	const [filter, setFilter] = useState("");
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const handleNameChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		const newName = evt.target.value;
		setPlaylistName(newName);
		setIsNameEmpty(newName.trim() === "");
	};

	const handleNameBlur = () => {
		if (playlistName.trim() === "") {
			setPlaylistName(initialPlaylist?.name || "");
			setIsNameEmpty(false);
		} else {
			updateName(playlistName.trim());
		}
	};

	return (
		<div className="min-h-screen flex overflow-hidden">
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
			<div className="flex-grow flex flex-col lg:ml-1/5 lg:ml-1/6 overflow-hidden">
				<TrackDropArea className="flex-grow lg:border-l flex flex-col justify-between overflow-hidden">
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
								<SharePlaylist trackId={trackId} />
							</div>
							<div className="lg:hidden">
								<DropdownMenu>
									<DropdownMenuTrigger>
										<HiOutlineDotsVertical className="text-2xl" />
									</DropdownMenuTrigger>
									<DropdownMenuContent className="bg-white border border-gray-200 rounded shadow-lg">
										<DropdownMenuItem className="p-2 hover:bg-gray-100 cursor-pointer text-black">
											<SharePlaylist trackId={trackId} />
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
						<div className="flex items-center justify-between mb-4">
							<input
								className={`border-none outline-none bg-transparent text-3xl font-semibold tracking-tight mt-5 w-full ${isNameEmpty ? "border-red-500" : ""}`}
								type="text"
								value={playlistName}
								onChange={handleNameChange}
								onBlur={handleNameBlur}
							/>
						</div>
						{isNameEmpty && (
							<p className="text-red-500">Playlist name cannot be empty.</p>
						)}
						<TrackList filter={filter} trackId={trackId} />
					</div>
					<PlayerControls trackId={trackId} />
				</TrackDropArea>
			</div>
		</div>
	);
}
