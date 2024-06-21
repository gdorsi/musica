import { usePlaylist } from "@/data/usePlaylist";
import { Link, useParams } from "react-router-dom";

export function Playlist() {
	const params = useParams<"documentId">();
	const { playlist, updateName } = usePlaylist(params.documentId);

	return (
		<div className="min-h-screen">
			<div className="h-full px-4 py-6 lg:px-8 overflow-auto">
				<div className="flex items-center justify-between mb-4">
					<input
						type="text"
						className="flex-grow mr-4"
						value={playlist?.name}
						onChange={(evt) => updateName(evt.target.value)}
					/>
				</div>
			</div>
			<Link to={"/"}>Go back</Link>
		</div>
	);
}
