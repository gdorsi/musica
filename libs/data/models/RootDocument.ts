import { DocumentId, Repo } from "@automerge/automerge-repo";
import { z } from "zod";
import { Did, DidSchema, DocumentIdSchema } from "../schema";

export const RootDocumentVersion = 1;
export const RootDocumentSchema = z.object({
	version: z.literal(RootDocumentVersion),
	tracks: z.array(DocumentIdSchema),
	// Not implemented yet
	playlists: z.array(DocumentIdSchema),
	name: z.string(),
	owner: DidSchema,
});
export type RootDocument = z.infer<typeof RootDocumentSchema>;

export function createRootDocument(repo: Repo, owner: Did, name: string) {
	const handle = repo.create<RootDocument>({
		version: RootDocumentVersion,
		tracks: [],
		playlists: [],
		name,
		owner,
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
