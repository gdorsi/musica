import { useDocument } from "@automerge/automerge-repo-react-hooks";
import { useState } from "react";
import type { MusicCollection, MusicItem } from "./schema";
import { useUserDocuments } from "./auth";
import { copyToPrivateFileSystem } from "@/lib/filesystem";

export function useMusicCollection() {
	const { collectionsUrls } = useUserDocuments();

	const [doc, change] = useDocument<MusicCollection>(collectionsUrls[0]);

	const [activeMedia, setActiveMedia] = useState<MusicItem | null>(null);

	async function addFilesToCollection(files: FileList | null) {
		if (!files) return;

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

	return {
		collection: doc?.items ?? [],
		addFilesToCollection,
		activeMedia,
		setActiveMedia,
	};
}
