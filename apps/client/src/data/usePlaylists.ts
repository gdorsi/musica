import { useDocuments, useRepo } from "@automerge/automerge-repo-react-hooks";
import { Playlist, PlaylistVersion, type MusicCollection } from "./schema";
import { useRootDocument } from "@/auth/useRootDocument";

export function usePlaylists() {
	const repo = useRepo();
	const [rootDocument, change] = useRootDocument();

	const playlists = useDocuments<MusicCollection>(
		rootDocument?.playlists ?? [],
	);

	function createPlaylist(name: string) {
		if (!rootDocument) return;

		const handle = repo.create<Playlist>({
			id: crypto.randomUUID(),
			items: [],
			name,
			owner: rootDocument?.owner,
			version: PlaylistVersion,
		});

		change((rootDocument) => {
			rootDocument.playlists.push(handle.url);
		});

		return handle.url;
	}

	return {
		createPlaylist,
		playlists,
	};
}

export type PlaylistsApi = ReturnType<typeof usePlaylists>;
