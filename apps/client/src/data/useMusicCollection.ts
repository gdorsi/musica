import { useRepo } from "@automerge/automerge-repo-react-hooks";
import { MusicItemVersion, type MusicItem } from "./schema";
import { getAudioFileData } from "../audio/getAudioFileData";
import { copyToPrivateFileSystem, deleteFile } from "@/storage/opfs";
import { useRootDocument } from "@/auth/useRootDocument";

export function useMusicCollection() {
	const repo = useRepo();
	const [rootDocument, change] = useRootDocument();

	async function addFilesToCollection(files: FileList | null) {
		if (!files) return;
		if (!rootDocument) return;

		for (const file of files) {
			const data = await getAudioFileData(file);

			const item: MusicItem = {
				id: crypto.randomUUID(),
				title: file.name,
				description: "",
				duration: data.duration,
				waveform: data.waveform,
				owner: rootDocument.owner,
				version: MusicItemVersion,
				file: {
					id: crypto.randomUUID(),
					name: file.name,
					type: file.type,
				},
			};

			const handle = repo.create(item);

			await copyToPrivateFileSystem(item.file.id, file);

			change(({ tracks }) => {
				tracks.push(handle.documentId);
			});
		}
	}

	function findDocumentHandle(item: MusicItem) {
		if (!rootDocument) return null;

		for (const documentId of rootDocument.tracks) {
			const handle = repo.find<MusicItem>(documentId);

			const doc = handle.docSync();

			if (doc?.id === item.id) {
				return handle;
			}
		}

		return null;
	}

	async function deleteItem(item: MusicItem) {
		const handle = findDocumentHandle(item);

		if (!handle) return;

		repo.delete(handle.documentId);

		change(({ tracks }) => {
			const index = tracks.findIndex((id) => id === handle.documentId);

			if (index === -1) return;

			tracks.splice(index, 1);
		});

		await deleteFile(item.file.id);
	}

	async function updateItem(item: MusicItem, patch: Partial<MusicItem>) {
		const handle = findDocumentHandle(item);

		if (!handle) return;

		handle.change((doc) => {
			Object.assign(doc, patch);
		});
	}

	return {
		addFilesToCollection,
		deleteItem,
		updateItem,
	};
}

export type MusicCollectionApi = ReturnType<typeof useMusicCollection>;
