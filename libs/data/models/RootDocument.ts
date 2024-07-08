import { DocumentId, Repo } from "@automerge/automerge-repo";
import { z } from "zod";
import { Did, DidSchema, DocumentIdSchema } from "../schema";
import { migrateTrack } from "./MusicItem";
import { migratePlaylist } from "./Playlist";

export const RootDocumentSchema = z.object({
	type: z.literal("musicCollection"),
	tracks: z.array(DocumentIdSchema),
	playlists: z.array(DocumentIdSchema),
	name: z.string(),
	owner: DidSchema,
	version: z.number(),
});
export type RootDocument = z.infer<typeof RootDocumentSchema>;

export function createRootDocument(repo: Repo, owner: Did, name: string) {
	const handle = repo.create<RootDocument>({
		type: "musicCollection",
		tracks: [],
		playlists: [],
		name,
		owner,
		version: 3,
	});

	return handle;
}

export function addPlaylistToRootDocument(
	repo: Repo,
	rootDocumentId: DocumentId,
	playlistId: DocumentId,
) {
	const handle = repo.find<RootDocument>(rootDocumentId);

	handle.change((doc) => {
		doc.playlists.push(playlistId);
	});

	return handle;
}

export async function migrateAllData(repo: Repo, rootDocumentId: DocumentId) {
	const handle = repo.find<RootDocument>(rootDocumentId);

	await handle.whenReady(["ready"]);

	const root = handle.docSync();

	if (!root) return;

	if (root.version < 3) {
		handle.change((doc) => {
			doc.type = "musicCollection"; // Added type field
			doc.version = 3;
		});
	}

	await Promise.all(root.tracks.map((trackId) => migrateTrack(repo, trackId)));
	await Promise.all(
		root.playlists.map((playlistId) =>
			migratePlaylist(repo, root.owner, playlistId),
		),
	);
}
