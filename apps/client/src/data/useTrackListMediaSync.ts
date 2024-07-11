import {
	useDocument,
	useDocuments,
} from "@automerge/automerge-repo-react-hooks";
import { useEffect } from "react";
import { getResourceDelegation } from "@/auth/permissions";
import { useUser } from "@/auth/useUser";
import { getSyncServerDid } from "@/auth/auth";
import { DocumentId } from "@automerge/automerge-repo";
import { MusicItem } from "@musica/shared/models/MusicItem";
import { Playlist } from "@musica/shared/models/Playlist";
import { RootDocument } from "@musica/shared/models/RootDocument";
import { User } from "@musica/shared/models/User";
import { mediaStorage } from "./storage/opfs";

async function syncLocalFilesToServer(
	user: User,
	tracks: Record<DocumentId, MusicItem>,
) {
	// TODO: sync tp multiple sync servers
	const [syncServer] = user.syncServers;

	const serverDid = await getSyncServerDid(syncServer);

	const documentId = user.rootDocument;

	// TODO: Capability check over the document list
	const token = await getResourceDelegation(
		user.id,
		serverDid,
		documentId,
		"read",
	);

	const res = await fetch(
		`${location.protocol}://${syncServer}/media/sync-check`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				documentId,
			}),
		},
	);

	if (!res.ok) return;

	const { missing } = (await res.json()) as { missing: DocumentId[] };

	for (const documentId of missing) {
		const track = tracks[documentId];

		if (!track) continue;

		const file = await mediaStorage.getFile(track.file.id);

		const token = await getResourceDelegation(
			user.id,
			serverDid,
			documentId,
			"write",
		);

		await fetch(`${location.protocol}://${syncServer}/media/${documentId}`, {
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
	tracks: Record<DocumentId, MusicItem>,
) {
	// TODO: Pull from multiple sync servers
	const [syncServer] = user.syncServers;

	const serverDid = await getSyncServerDid(syncServer);

	for (const [documentId, item] of Object.entries(tracks)) {
		if (!(await mediaStorage.fileExist(item.file.id))) {
			const token = await getResourceDelegation(
				user.id,
				serverDid,
				documentId,
				"read",
			);

			const res = await fetch(
				`${location.protocol}://${syncServer}/media/${documentId}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (res.ok) {
				const blob = await res.blob();

				await mediaStorage.storeFile(item.file.id, blob);
			}
		}
	}
}

export function useTrackListMediaSync(trackId: DocumentId | undefined) {
	const user = useUser();

	const [doc] = useDocument<Playlist | RootDocument>(trackId);

	const tracks = useDocuments<MusicItem>(doc?.tracks);

	// TODO: Move this logic into xstate and make it more resilient
	useEffect(() => {
		if (user.syncServers.length === 0) return;

		syncLocalFilesToServer(user, tracks);
		pullMissingFilesFromServer(user, tracks);
	}, [user, tracks]);
}
