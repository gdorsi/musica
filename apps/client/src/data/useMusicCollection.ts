import { useDocument } from "@automerge/automerge-repo-react-hooks";
import type { MusicCollection, MusicItem } from "./schema";
import { getAudioFileData } from "../audio/getAudioFileData";
import { copyToPrivateFileSystem, deleteFile } from "@/storage/opfs";
import { useRootDocument } from "@/auth/useRootDocument";

export function useMusicCollection() {
	const [document] = useRootDocument();

	const [doc, change] = useDocument<MusicCollection>(document?.musicCollection);

	async function addFilesToCollection(files: FileList | null) {
		if (!files) return;
		if (!document) return;

		const musicItems: MusicItem[] = [];

		for (const file of files) {
			const data = await getAudioFileData(file);

			const item: MusicItem = {
				id: crypto.randomUUID(),
				title: file.name,
				description: "",
				duration: data.duration,
				waveform: data.waveform,
				file: {
					id: crypto.randomUUID(),
					name: file.name,
					type: file.type,
				},
			};

			await copyToPrivateFileSystem(item.file.id, file);

			musicItems.push(item);
		}

		change(({ items }) => {
			items.push(...musicItems);
		});
	}

	const collection = doc?.items ?? [];

	async function deleteItem(item: MusicItem) {
		change((doc) => {
			const index = doc.items.findIndex(({ id }) => id === item.id);

			if (index === -1) return;

			doc.items.splice(index, 1);
		});

		await deleteFile(item.file.id);
	}

	async function updateItem(item: MusicItem, patch: Partial<MusicItem>) {
		change((doc) => {
			const index = doc.items.findIndex(({ id }) => id === item.id);

			if (index === -1) return;

			Object.assign(doc.items[index], patch);
		});

		await deleteFile(item.file.id);
	}

	return {
		collection,
		addFilesToCollection,
		deleteItem,
		updateItem,
	};
}

export type MusicCollectionApi = ReturnType<typeof useMusicCollection>;
