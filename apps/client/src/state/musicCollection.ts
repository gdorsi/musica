import { useDocument } from "@automerge/automerge-repo-react-hooks";
import { useEffect, useMemo, useState } from "react";
import type {
	Did,
	MusicCollection,
	MusicFile,
	MusicItem,
	User,
} from "./schema";
import { getAuthToken, useUser, useRootDocument } from "./auth";
import { copyToPrivateFileSystem, exist, getFile } from "@/lib/filesystem";

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

	return {
		collection: doc?.items ?? [],
		addFilesToCollection,
		activeMedia,
		setActiveMedia,
	};
}

async function getSyncServerDid(syncServer: string) {
	const res = await fetch(`http://${syncServer}/media/did`);

	const { did } = await res.json();

	return did as Did;
}

async function syncLocalFilesToServer(
	user: User,
	rootOwner: Did,
	files: MusicFile[],
) {
	// TODO: sync tp multiple sync servers
	const [syncServer] = user.syncServers;

	const serverDid = await getSyncServerDid(syncServer);

	const token = await getAuthToken(user, serverDid, `media/sync-check`);

	const res = await fetch(`http://${syncServer}/media/sync-check`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			user: rootOwner,
			list: files.map((file) => file.id),
		}),
	});

	if (!res.ok) return;

	const { missing } = (await res.json()) as { missing: string[] };

	for (const fileId of missing) {
		const file = await getFile(fileId);
		const musicFile = files.find((i) => i.id === fileId);

		if (!musicFile) continue;

		const token = await getAuthToken(user, serverDid, `media/${musicFile.id}`);

		await fetch(`http://${syncServer}/media/${rootOwner}/${musicFile.id}`, {
			method: "PUT",
			body: file,
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
	}
}

async function pullMissingFilesFromServer(
	user: User,
	rootOwner: Did,
	files: MusicItem["file"][],
) {
	// TODO: Pull from multiple sync servers
	const [syncServer] = user.syncServers;

	const serverDid = await getSyncServerDid(syncServer);

	for (const musicFile of files) {
		if (!(await exist(musicFile.id))) {
			const token = await getAuthToken(
				user,
				serverDid,
				`media/${musicFile.id}`,
			);

			const res = await fetch(
				`http://${syncServer}/media/${rootOwner}/${musicFile.id}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
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
	const documents = useRootDocument();

	const [doc] = useDocument<MusicCollection>(documents?.musicCollection);

	const files = useMemo(
		() => doc?.items.map((item) => item.file) ?? [],
		[doc?.items],
	);

	// TODO: Move this logic into xstate and make it more resilient
	useEffect(() => {
		if (!files.length) return;
		if (!doc) return;

		syncLocalFilesToServer(user, doc.owner, files);
		pullMissingFilesFromServer(user, doc.owner, files);
	}, [user, files, doc]);
}
