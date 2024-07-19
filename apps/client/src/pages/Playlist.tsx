import { usePlaylist } from "@/data/usePlaylist";
import { Link, useParams } from "react-router-dom";
import { TrackDropArea } from "../components/recipes/track-drop-area";
import { TrackList } from "../components/recipes/track-list";
import { Input } from "../components/ui/input";
import { useMemo, useState } from "react";
import { DocumentIdSchema } from "@musica/shared/schema";
import { SharePlaylist } from "../components/recipes/share-playlist";

export function Playlist() {
	const params = useParams<"documentId">();
	const { playlist, updateName } = usePlaylist(params.documentId);

	const trackId = useMemo(
		() => DocumentIdSchema.parse(params.documentId),
		[params.documentId],
	);

	const [filter, setFilter] = useState("");

	return (
		<div className="min-h-screen">
			<TrackDropArea className="col-span-4 lg:border-l flex flex-col justify-between">
				<div className="h-full px-4 py-6 lg:px-8 overflow-auto">
					<div className="flex items-center justify-between mb-4">
						<input
							type="text"
							className="flex-grow mr-4"
							value={playlist?.name}
							onChange={(evt) => updateName(evt.target.value)}
						/>
					</div>
					<Link to={"/"}>Go back</Link>
					<SharePlaylist trackId={trackId} />
				</div>
				<div className="h-full px-4 py-6 lg:px-8 overflow-auto">
					<div className="flex items-center justify-between mb-4">
						<Input
							type="search"
							placeholder="Search by Name or Tag"
							className="flex-grow mr-4"
							onChange={(evt) => setFilter(evt.target.value)}
						/>
					</div>
					<TrackList filter={filter} trackId={trackId} />
				</div>
			</TrackDropArea>
		</div>
	);
}
