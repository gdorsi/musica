import { useDocuments, useRepo } from "@automerge/automerge-repo-react-hooks";
import { useRootDocument } from "@/auth/useRootDocument";
import {
	Playlist,
	createPlaylist as createPlaylistDocument,
} from "./models/Playlist";
import { addPlaylistToRootDocument } from "./models/RootDocument";
import { useUser } from "@/auth/useUser";

export function usePlaylists() {
	const repo = useRepo();
	const user = useUser();
	const [rootDocument] = useRootDocument();

	const playlists = useDocuments<Playlist>(rootDocument?.playlists ?? []);

	function createPlaylist(name: string) {
		if (!rootDocument) return;

		const handle = createPlaylistDocument(repo, rootDocument.owner, name);

		addPlaylistToRootDocument(repo, user.rootDocument, handle.documentId);

		return handle.documentId;
	}

	return {
		createPlaylist,
		playlists: Object.entries(playlists),
	};
}

export type PlaylistsApi = ReturnType<typeof usePlaylists>;
