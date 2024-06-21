import { DocumentId } from "@automerge/automerge-repo";
import { useDocument } from "@automerge/automerge-repo-react-hooks";
import { Playlist } from "./schema";

export function usePlaylist(documentId: string | undefined) {
	const [playlist, change] = useDocument<Playlist>(documentId as DocumentId);

	function updateName(name: string) {
		change((doc) => {
			doc.name = name;
		});
	}

	return {
		playlist,
		updateName,
	};
}

export type PlaylistApi = ReturnType<typeof usePlaylist>;
