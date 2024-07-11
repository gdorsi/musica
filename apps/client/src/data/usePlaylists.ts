import { useDocuments, useRepo } from "@automerge/automerge-repo-react-hooks";
import { useRootDocument } from "@/auth/useRootDocument";

import { useUser } from "@/auth/useUser";
import { Playlist, createPlaylist } from "@musica/shared/models/Playlist";
import { addPlaylistToRootDocument } from "@musica/shared/models/RootDocument";

export function usePlaylists() {
	const repo = useRepo();
	const user = useUser();
	const [rootDocument] = useRootDocument();

	const playlists = useDocuments<Playlist>(rootDocument?.playlists ?? []);

	return {
		createPlaylist(name: string) {
			if (!rootDocument) return;

			const handle = createPlaylist(repo, rootDocument.owner, name);

			addPlaylistToRootDocument(repo, user.rootDocument, handle.documentId);

			return handle.documentId;
		},
		playlists: Object.entries(playlists),
	};
}

export type PlaylistsApi = ReturnType<typeof usePlaylists>;
