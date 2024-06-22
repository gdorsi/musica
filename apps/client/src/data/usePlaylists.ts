import { useDocuments, useRepo } from "@automerge/automerge-repo-react-hooks";
import { Playlist, PlaylistVersion } from "./schema";
import { useRootDocument } from "@/auth/useRootDocument";

export function usePlaylists() {
	const repo = useRepo();
	const [rootDocument, change] = useRootDocument();

	const playlists = useDocuments<Playlist>(rootDocument?.playlists ?? []);

	function createPlaylist(name: string) {
		if (!rootDocument) return;

		const handle = repo.create<Playlist>({
			id: crypto.randomUUID(),
			tracks: [],
			name,
			owner: rootDocument?.owner,
			version: PlaylistVersion,
		});

		change((rootDocument) => {
			rootDocument.playlists.push(handle.documentId);
		});

		return handle.documentId;
	}

	return {
		createPlaylist,
		playlists: Object.entries(playlists),
	};
}

export type PlaylistsApi = ReturnType<typeof usePlaylists>;
