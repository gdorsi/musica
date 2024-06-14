import { useDocument } from "@automerge/automerge-repo-react-hooks";
import { useState } from "react";
import type { MusicCollection, MusicItem } from "./schema";
import { copyToPrivateFileSystem, getFile } from "@/storage/opfs";
import { useRootDocument } from "@/auth/useRootDocument";

export function useMusicCollection() {
	const document = useRootDocument();

	const [doc, change] = useDocument<MusicCollection>(document?.musicCollection);

	const [activeMedia, setActiveMedia] = useState<MusicItem | null>(null);

	async function addFilesToCollection(files: FileList | null) {
		if (!files) return;
		if (!document) return;

		const musicItems: MusicItem[] = [];

		for (const file of files) {
			const item: MusicItem = {
				id: crypto.randomUUID(),
				title: file.name.replace(/\..+?$/, ""),
				description: "",
				file: {
					id: crypto.randomUUID(),
					name: file.name,
					type: file.type,
				},
			};

			musicItems.push(item);
			await copyToPrivateFileSystem(item.file.id, file);
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

	return {
		collection,
		addFilesToCollection,
		activeMedia,
		setActiveMedia,
		getNextSong,
		getPrevSong,
		getMusicItemFile,
	};
}
