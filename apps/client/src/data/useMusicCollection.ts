import { useRootDocument } from "@/auth/useRootDocument";
import { useRepo } from "@automerge/automerge-repo-react-hooks";

import { useUser } from "@/auth/useUser";
import {
	createMusicItem,
	MusicItem,
	deleteMusicItem,
	updateMusicItem,
} from "@musica/data/models/MusicItem";
import {
	addTrackToPlaylist,
	removeTrackFromPlaylist,
	findTrackDocumentId,
} from "@musica/data/models/Playlist";
import { getAudioFileData } from "@/audio/getAudioFileData";
import { mediaStorage } from "./storage/opfs";

export function useMusicCollection() {
	const repo = useRepo();
	const [rootDocument] = useRootDocument();
	const user = useUser();

	async function addFilesToCollection(files: FileList | null) {
		if (!files) return;
		if (!rootDocument) return;

		for (const file of files) {
			const data = await getAudioFileData(file);
			const handle = await createMusicItem(
				repo,
				file,
				data,
				mediaStorage,
				rootDocument.owner,
			);
			addTrackToPlaylist(repo, user.rootDocument, handle.documentId);
		}
	}

	async function deleteItem(item: MusicItem) {
		const trackId = removeTrackFromPlaylist(repo, user.rootDocument, item);

		if (trackId) {
			await deleteMusicItem(repo, trackId, mediaStorage);
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
