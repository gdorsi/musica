import type { PublicKey } from "@dxos/react-client";
import { Filter, create, useQuery, useSpace } from "@dxos/react-client/echo";
import { useIdentity } from "@dxos/react-client/halo";
import { useState } from "react";
import { fileToMediaCollectionFile } from "../lib/file";
import { MusicCollectionItem } from "./types";

export type MusicCollectionDocument = { collection: MusicCollectionItem[] };

export function useMusicCollection(key?: PublicKey) {
	useIdentity();
	const space = useSpace(key);
	const collection = useQuery<MusicCollectionItem>(
		space,
		Filter.schema(MusicCollectionItem),
	);

	const [activeMedia, setActiveMedia] = useState<MusicCollectionItem | null>(
		null,
	);

	async function addFilesToCollection(files: FileList | null) {
		if (!files) return;
		if (!space) return;

		for (const file of files) {
			const sFile = await fileToMediaCollectionFile(file);

			const task = create(MusicCollectionItem, {
				type: "media",
				title: file.name.replace(/\..+?$/, ""),
				file: sFile,
			});
			space?.db.add(task);
		}
	}

	return {
		collection,
		addFilesToCollection,
		activeMedia,
		setActiveMedia,
	};
}
