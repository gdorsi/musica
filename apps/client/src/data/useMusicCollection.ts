import { useRootDocument } from "@/auth/useRootDocument";
import { useRepo } from "@automerge/automerge-repo-react-hooks";
import {
	MusicItem,
	createMusicItem,
	deleteMusicItem,
	updateMusicItem,
} from "./models/MusicItem";
import {
	addTrackToPlaylist,
	findTrackDocumentId,
	removeTrackFromPlaylist,
} from "./models/Playlist";
import { useUser } from "@/auth/useUser";

export function useMusicCollection() {
	const repo = useRepo();
	const [rootDocument] = useRootDocument();
	const user = useUser();

	async function addFilesToCollection(files: FileList | null) {
		if (!files) return;
		if (!rootDocument) return;

		for (const file of files) {
			const handle = await createMusicItem(repo, file, rootDocument.owner);
			addTrackToPlaylist(repo, user.rootDocument, handle.documentId);
		}
	}

	async function deleteItem(item: MusicItem) {
		const trackId = removeTrackFromPlaylist(repo, user.rootDocument, item);

		if (trackId) {
			await deleteMusicItem(repo, trackId);
		}
	}

	async function updateItem(item: MusicItem, patch: Partial<MusicItem>) {
		const trackId = findTrackDocumentId(repo, user.rootDocument, item);

		if (!trackId) return;

		updateMusicItem(repo, trackId, patch);
	}

	return {
		addFilesToCollection,
		deleteItem,
		updateItem,
	};
}

export type MusicCollectionApi = ReturnType<typeof useMusicCollection>;
