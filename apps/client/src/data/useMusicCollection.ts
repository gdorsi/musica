import { useDocument } from "@automerge/automerge-repo-react-hooks";
import { useState } from "react";
import type { MusicCollection, MusicItem } from "./schema";
import { getAudioFileData } from "../audio/getAudioFileData";
import { copyToPrivateFileSystem, deleteFile, getFile } from "@/storage/opfs";
import { useRootDocument } from "@/auth/useRootDocument";

export function useMusicCollection() {
	const [document] = useRootDocument();

	const [doc, change] = useDocument<MusicCollection>(document?.musicCollection);

	const [activeMedia, setActiveMedia] = useState<MusicItem | null>(null);

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

	function getNextSong() {
		const currentIndex = collection.findIndex((item) => item === activeMedia);
		const nextIndex = (currentIndex + 1) % collection.length;

		return collection[nextIndex];
	}

	function getPrevSong() {
		const currentIndex = collection.findIndex((item) => item === activeMedia);
		const previousIndex =
			(currentIndex - 1 + collection.length) % collection.length;
		return collection[previousIndex];
	}

	function getMusicItemFile(item: MusicItem) {
		return getFile(item.file.id);
	}

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
		activeMedia,
		setActiveMedia,
		getNextSong,
		getPrevSong,
		getMusicItemFile,
	};
}

export type MusicCollectionApi = ReturnType<typeof useMusicCollection>;
