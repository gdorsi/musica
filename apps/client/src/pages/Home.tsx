import { Input } from "../components/ui/input";
import { useState } from "react";
import { AddNewDevice } from "../components/recipes/add-new-device";
import { TrackList } from "../components/recipes/track-list";
import { NewPlaylistButton } from "../components/recipes/add-new-playlist";
import { usePlaylists } from "@/data/usePlaylists";
import { Link } from "react-router-dom";
import { PlayerControls } from "../components/recipes/player-controls";
import { TrackDropArea } from "../components/recipes/track-drop-area";
import { TrackUploadButton } from "../components/recipes/track-upload-button";
import { useUser } from "@/auth/useUser";
import { ShowDeviceId } from "../components/recipes/show-device-id";

export function Home() {
	const user = useUser();
	const trackId = user.rootDocument;

	const [filter, setFilter] = useState("");

	const { playlists } = usePlaylists();

	return (
		<div className="min-h-screen">
			<TrackDropArea className="col-span-4 lg:border-l flex flex-col justify-between">
				<div className="h-full px-4 py-6 lg:px-8 overflow-auto">
					<div className="flex items-center justify-between mb-4">
						<Input
							type="search"
							placeholder="Search by Name or Tag"
							className="flex-grow mr-4"
							onChange={(evt) => setFilter(evt.target.value)}
						/>
						<div className="flex items-center space-x-4">
							<TrackUploadButton />
							<AddNewDevice />
							<NewPlaylistButton />
							<ShowDeviceId />
						</div>
					</div>
					<div className="flex items-center gap-4 mb-4">
						{playlists.map(([documentId, playlist]) => (
							<Link key={documentId} to={`/playlist/${documentId}`}>
								{playlist.name}
							</Link>
						))}
					</div>
					<TrackList filter={filter} trackId={trackId} />
				</div>
				<PlayerControls trackId={trackId} />
			</TrackDropArea>
		</div>
	);
}
