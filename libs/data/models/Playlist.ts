import { DocumentId, Repo } from "@automerge/automerge-repo";
import { z } from "zod";
import { Did, DidSchema, DocumentIdSchema } from "../schema";
import { MusicItem } from "./MusicItem";

export const PlaylistSchema = z.object({
	type: z.literal("playlist"),
	id: z.string().uuid(),
	name: z.string(),
	tracks: z.array(DocumentIdSchema),
	owner: DidSchema,
	version: z.number(),
});
export type Playlist = z.infer<typeof PlaylistSchema>;

export function createPlaylist(repo: Repo, owner: Did, name: string) {
	const handle = repo.create<Playlist>({
		type: "playlist",
		id: crypto.randomUUID(),
		tracks: [],
		name,
		owner,
		version: 3,
	});

	return handle;
}

export function findTrackDocumentId(
	repo: Repo,
	playlistId: DocumentId,
	item: MusicItem,
) {
	const handle = repo.find<Playlist>(playlistId);
	const playlist = handle.docSync();

	if (!playlist) return null;

	for (const documentId of playlist.tracks) {
		const handle = repo.find<MusicItem>(documentId);

		const doc = handle.docSync();

		if (doc?.id === item.id) {
			return documentId;
		}
	}

	return null;
}

export function updatePlaylistName(
	repo: Repo,
	playlistId: DocumentId,
	name: string,
) {
	const handle = repo.find<Playlist>(playlistId);

	handle.change((doc) => {
		doc.name = name;
	});
}

export function addTrackToPlaylist(
	repo: Repo,
	playlistId: DocumentId,
	trackId: DocumentId,
) {
	const playlistHandle = repo.find<Playlist>(playlistId);
	const trackHandle = repo.find<MusicItem>(trackId);

	playlistHandle.change((doc) => {
		if (Array.from(doc.tracks).includes(trackId)) {
			return;
		}

		doc.tracks.push(trackId);
	});

	trackHandle.change((doc) => {
		if (Array.from(doc.playlists).includes(playlistId)) {
			return;
		}

		doc.playlists.push(playlistId);
	});
}

export function removeTrackFromPlaylist(
	repo: Repo,
	playlistId: DocumentId,
	item: MusicItem,
) {
	const trackId = findTrackDocumentId(repo, playlistId, item);

	if (trackId === null) return;

	const playlistHandle = repo.find<Playlist>(playlistId);
	const trackHandle = repo.find<MusicItem>(trackId);

	playlistHandle.change((doc) => {
		const index = Array.from(doc.tracks).indexOf(trackId);

		if (index >= 0) {
			doc.tracks.splice(index, 1);
		}
	});

	trackHandle.change((doc) => {
		const index = Array.from(doc.playlists).indexOf(playlistId);

		if (index >= 0) {
			doc.playlists.splice(index, 1);
		}
	});

	return playlistHandle.documentId;
}

export async function migratePlaylist(
	repo: Repo,
	owner: Did,
	playlistId: DocumentId,
) {
	const handle = repo.find<Playlist>(playlistId);

	await handle.whenReady(["ready"]);

	const playlist = handle.docSync();

	if (!playlist) return;
	if (playlist.owner !== owner) return;

	if (playlist.version === 1) {
		handle.change((doc) => {
			doc.type = "playlist"; // Added type field
			doc.version = 2;
		});
	}

	if (playlist.version === 2) {
		// Add the two-way reference between the track and the playlist
		for (const trackId of playlist.tracks) {
			const trackHandle = repo.find<MusicItem>(trackId);

			await trackHandle.whenReady();

			trackHandle.change((doc) => {
				if (!doc.playlists) {
					doc.playlists = [];
				}

				if (Array.from(doc.playlists).includes(playlistId)) {
					return;
				}

				doc.playlists.push(playlistId);
			});
		}

		handle.change((doc) => {
			doc.version = 3;
		});
	}
}
