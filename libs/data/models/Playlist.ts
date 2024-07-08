import { DocumentId, Repo } from "@automerge/automerge-repo";
import { z } from "zod";
import { Did, DidSchema, DocumentIdSchema } from "../schema";
import { MusicItem } from "./MusicItem";

export const PlaylistSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	tracks: z.array(DocumentIdSchema),
	owner: DidSchema,
});
export type Playlist = z.infer<typeof PlaylistSchema>;

export function createPlaylist(repo: Repo, owner: Did, name: string) {
	const handle = repo.create<Playlist>({
		id: crypto.randomUUID(),
		tracks: [],
		name,
		owner,
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
	const handle = repo.find<Playlist>(playlistId);

	handle.change((doc) => {
		doc.tracks.push(trackId);
	});
}

export function removeTrackFromPlaylist(
	repo: Repo,
	playlistId: DocumentId,
	item: MusicItem,
) {
	const documentId = findTrackDocumentId(repo, playlistId, item);

	if (documentId === null) return;

	const handle = repo.find<Playlist>(playlistId);

	handle.change((doc) => {
		const index = Array.from(doc.tracks).indexOf(documentId);

		if (index >= 0) {
			doc.tracks.splice(index, 1);
		}
	});

	return handle.documentId;
}
