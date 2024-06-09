import { useDocument } from "@automerge/automerge-repo-react-hooks";
import { useEffect, useMemo, useState } from "react";
import type { MusicCollection, MusicItem, User } from "./schema";
import { useUser, useUserDocuments } from "./auth";
import { copyToPrivateFileSystem, exist, getFile } from "@/lib/filesystem";

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

async function syncLocalFilesToServer(user: User, files: MusicItem["file"][]) {
	// TODO: sync tp multiple sync servers
	const [syncServer] = user.syncServers;

	const res = await fetch(`http://${syncServer}/media/sync-check`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			user: user.id,
			list: files.map((file) => file.id),
		}),
	});

	const { missing } = (await res.json()) as { missing: string[] };

	for (const fileId of missing) {
		const file = await getFile(fileId);

		await fetch(`http://${syncServer}/media/${user.id}/${fileId}`, {
			method: "PUT",
			body: file,
		});
	}
}

async function pullMissingFilesFromServer(
	user: User,
	ownerId: User["id"],
	files: MusicItem["file"][],
) {
	// TODO: Pull from multiple sync servers
	const [syncServer] = user.syncServers;

	for (const musicFile of files) {
		if (!(await exist(musicFile.id))) {
			const res = await fetch(
				`http://${syncServer}/media/${ownerId}/${musicFile.id}`,
			);

			if (res.ok) {
				const blob = await res.blob();

				await copyToPrivateFileSystem(musicFile.id, blob);
			}
		}
	}
}

export function useMusicCollectionMediaSync() {
	const user = useUser();
	const { collectionsUrls } = useUserDocuments();

	const [doc] = useDocument<MusicCollection>(collectionsUrls[0]);

	const files = useMemo(
		() => doc?.items.map((item) => item.file) ?? [],
		[doc?.items],
	);

	// TODO: Move this logic into xstate and make it more resilient
	useEffect(() => {
		if (!files.length) return;

		syncLocalFilesToServer(user, files);

		if (doc?.owner) {
			pullMissingFilesFromServer(user, doc.owner, files);
		}
	}, [user, files, doc?.owner]);
}
