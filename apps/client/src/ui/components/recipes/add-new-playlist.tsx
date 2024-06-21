import { Button } from "../ui/button";
import { FaPlus } from "react-icons/fa";

import { usePlaylists } from "@/data/usePlaylists";
import { useNavigate } from "react-router-dom";

export function NewPlaylistButton() {
	const navigate = useNavigate();
	const { createPlaylist } = usePlaylists();

	function handleCreatePlaylist() {
		const url = createPlaylist("New playlist");

		if (url) {
			navigate(`/playlist/${url}`);
		}
	}

	return (
		<Button className="flex gap-2" onClick={handleCreatePlaylist}>
			<FaPlus /> New playlist
		</Button>
	);
}
