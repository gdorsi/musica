import { getSyncServerDid } from "@/auth/auth";
import { getResourceDelegation } from "@/auth/permissions";
import { useUser } from "@/auth/useUser";
import { DocumentId, Repo } from "@automerge/automerge-repo";
import {
	useDocument,
	useDocuments,
	useRepo,
} from "@automerge/automerge-repo-react-hooks";
import { MusicItem } from "@musica/shared/models/MusicItem";
import { Playlist } from "@musica/shared/models/Playlist";
import { RootDocument } from "@musica/shared/models/RootDocument";
import { User } from "@musica/shared/models/User";
import { useEffect, useRef } from "react";

import { mediaStorage } from "./storage/opfs";
import { promiseWithResolvers } from "@/utils";

async function pushLocalFileToServer(
	user: User,
	repo: Repo,
	syncServer: string,
	trackId: DocumentId,
) {
	const handle = repo.find<MusicItem>(trackId);

	const track = handle.docSync();

	if (!track) return;

	const serverDid = await getSyncServerDid(syncServer);

	const file = await mediaStorage.getFile(track.file.id);

	const token = await getResourceDelegation(
		user.id,
		serverDid,
		trackId,
		"write",
	);

	await fetch(`${location.protocol}//${syncServer}/media/${trackId}`, {
		method: "PUT",
		body: file,
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});

	handle.change((doc) => {
		doc.file.mediaServers.push(syncServer);
	});
}

async function pullFileFromServer(
	user: User,
	syncServer: string,
	trackId: DocumentId,
	track: MusicItem,
) {
	const serverDid = await getSyncServerDid(syncServer);

	const token = await getResourceDelegation(
		user.id,
		serverDid,
		trackId,
		"read",
	);

	const res = await fetch(
		`${location.protocol}//${syncServer}/media/${trackId}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (res.ok) {
		const blob = await res.blob();

		await mediaStorage.storeFile(track.file.id, blob);
	}
}

async function getMediaState(track: MusicItem, syncServer: string) {
	return {
		local: await mediaStorage.fileExist(track.file.id),
		remote: track.file.mediaServers.includes(syncServer),
	};
}

const completedMap = new Map<string, Set<DocumentId>>();

async function syncCheck(
	user: User,
	repo: Repo,
	syncServer: string,
	tracks: Record<DocumentId, MusicItem>,
) {
	const completed = completedMap.get(syncServer) || new Set();
	completedMap.set(syncServer, completed);

	const requests = [];

	for (const trackId of Object.keys(tracks) as DocumentId[]) {
		if (completed.has(trackId)) continue;

		const track = tracks[trackId];

		const state = await getMediaState(track, syncServer);

		if (state.local && state.remote) {
			completed.add(trackId);
		} else if (state.local && !state.remote) {
			requests.push(pushLocalFileToServer(user, repo, syncServer, trackId));
		} else if (!state.local && state.remote) {
			requests.push(pullFileFromServer(user, syncServer, trackId, track));
		}
	}

	await Promise.allSettled(requests);

	return completed.size === Object.keys(tracks).length;
}

export function useTrackListMediaSync(trackId: DocumentId | undefined) {
	const user = useUser();
	const repo = useRepo();

	const [doc] = useDocument<Playlist | RootDocument>(trackId);

	const tracks = useDocuments<MusicItem>(doc?.tracks);
	const tracksRef = useRef(tracks);
	tracksRef.current = tracks;

	useEffect(() => {
		if (user.syncServers.length === 0) return;

		let canceled = false;
		let timeout: ReturnType<typeof setTimeout> | null = null;

		async function main() {
			while (!canceled) {
				const wait = promiseWithResolvers();
				timeout = setTimeout(wait.resolve, 5000);
				await wait.promise;

				const tracks = tracksRef.current;

				for (const syncServer of user.syncServers) {
					await syncCheck(user, repo, syncServer, tracks);
				}
			}
		}

		main();

		return () => {
			canceled = true;
			if (timeout) {
				clearTimeout(timeout);
			}
		};
	}, [user, repo]);
}
