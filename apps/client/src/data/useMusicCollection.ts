import { useDocuments, useRepo } from "@automerge/automerge-repo-react-hooks";
import { MusicItemVersion, type MusicItem } from "./schema";
import { getAudioFileData } from "../audio/getAudioFileData";
import { copyToPrivateFileSystem, deleteFile } from "@/storage/opfs";
import { useRootDocument } from "@/auth/useRootDocument";
import { DocumentId } from "@automerge/automerge-repo";
import { useMemo } from "react";

export function useMusicCollection() {
	const repo = useRepo();
	const [rootDocument, change] = useRootDocument();

	const musicCollection = useDocuments<MusicItem>(rootDocument?.tracks);

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

	const tracks = useMemo(
		() => Object.values(musicCollection),
		[musicCollection],
	);

	function findDocumentId(item: MusicItem) {
		const entry = Object.entries(musicCollection).find(
			(entry) => item === entry[1],
		);

		return (entry?.[0] as DocumentId) ?? null;
	}

	async function deleteItem(item: MusicItem) {
		const documentId = findDocumentId(item);

		if (!documentId) return;

		repo.delete(documentId);

		change(({ tracks }) => {
			const index = tracks.findIndex((id) => id === documentId);

			if (index === -1) return;

			tracks.splice(index, 1);
		});

		await deleteFile(item.file.id);
	}

	async function updateItem(item: MusicItem, patch: Partial<MusicItem>) {
		const documentId = findDocumentId(item);

		if (!documentId) return;

		const musicItem = repo.find<MusicItem>(documentId);

		musicItem.change((doc) => {
			Object.assign(doc, patch);
		});
	}

	return {
		tracks,
		addFilesToCollection,
		deleteItem,
		updateItem,
		findDocumentId,
	};
}

export type MusicCollectionApi = ReturnType<typeof useMusicCollection>;
