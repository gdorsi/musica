import { useDocument } from "@automerge/automerge-repo-react-hooks";
import { useEffect, useMemo } from "react";
import type {
	Did,
	MusicCollection,
	MusicFile,
	MusicItem,
	User,
} from "./schema";
import { copyToPrivateFileSystem, exist, getFile } from "@/storage/opfs";
import { getResourceDelegation } from "@/auth/permissions";
import { useRootDocument } from "@/auth/useRootDocument";
import { useUser } from "@/auth/useUser";
import { getSyncServerDid } from "@/auth/auth";

async function syncLocalFilesToServer(
	user: User,
	rootOwner: Did,
	files: MusicFile[],
) {
	// TODO: sync tp multiple sync servers
	const [syncServer] = user.syncServers;

	const serverDid = await getSyncServerDid(syncServer);

	const token = await getResourceDelegation(
		user.id,
		serverDid,
		`media/sync-check`,
		"read",
	);

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

		const token = await getResourceDelegation(
			user.id,
			serverDid,
			`media/${musicFile.id}`,
			"write",
		);

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
			const token = await getResourceDelegation(
				user.id,
				serverDid,
				`media/${musicFile.id}`,
				"read",
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
	const [document] = useRootDocument();

	const [musicCollection] = useDocument<MusicCollection>(
		document?.musicCollection,
	);

	const files = useMemo(
		() => musicCollection?.items.map((item) => item.file) ?? [],
		[musicCollection?.items],
	);

	// TODO: Move this logic into xstate and make it more resilient
	useEffect(() => {
		if (!files.length) return;
		if (!musicCollection) return;

		syncLocalFilesToServer(user, musicCollection.owner, files);
		pullMissingFilesFromServer(user, musicCollection.owner, files);
	}, [user, files, musicCollection]);
}
