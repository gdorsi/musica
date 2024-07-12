import { z } from "zod";
import { Did, DidSchema, DocumentIdSchema } from "../schema";
import { DocumentId, Repo } from "@automerge/automerge-repo";
import { MediaStorageApi } from "../mediaStorage";

export const MusicFileSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	type: z.string(),
	mediaServers: z.array(z.string()),
});
export type MusicFile = z.infer<typeof MusicFileSchema>;

export const MusicItemSchema = z.object({
	type: z.literal("track"),
	id: z.string().uuid(),
	file: MusicFileSchema,
	title: z.string(),
	description: z.string(),
	duration: z.number(),
	waveform: z.array(z.number()),
	owner: DidSchema,
	playlists: z.array(DocumentIdSchema),
	version: z.number(),
});

export type MusicItem = z.infer<typeof MusicItemSchema>;

export async function createMusicItem(
	repo: Repo,
	file: File,
	preprocessedData: {
		waveform: number[];
		duration: number;
	},
	mediaStorage: MediaStorageApi,
	owner: Did,
) {
	const item: MusicItem = {
		type: "track",
		id: crypto.randomUUID(),
		title: file.name,
		description: "",
		duration: preprocessedData.duration,
		waveform: preprocessedData.waveform,
		owner,
		file: {
			id: crypto.randomUUID(),
			name: file.name,
			type: file.type,
			mediaServers: [],
		},
		playlists: [],
		version: 4,
	};

	await mediaStorage.storeFile(item.file.id, file);

	return repo.create(item);
}

export async function updateMusicItem(
	repo: Repo,
	documentId: DocumentId,
	patch: Partial<MusicItem>,
) {
	const handle = repo.find<MusicItem>(documentId);

	handle.change((doc) => {
		Object.assign(doc, patch);
	});
}

export async function deleteMusicItem(
	repo: Repo,
	documentId: DocumentId,
	mediaStorage: MediaStorageApi,
) {
	const handle = repo.find<MusicItem>(documentId);

	const item = handle.docSync();

	if (item) {
		await mediaStorage.deleteFile(item.file.id);
	}

	repo.delete(documentId);
}

export async function migrateTrack(repo: Repo, trackId: DocumentId) {
	const handle = repo.find<MusicItem>(trackId);

	await handle.whenReady(["ready"]);

	const track = handle.docSync();

	if (!track) return;

	if (track.version === 1) {
		handle.change((doc) => {
			doc.type = "track"; // Added type field
			doc.version = 2;
		});
	}

	if (track.version === 2) {
		handle.change((doc) => {
			if (!doc.playlists) {
				doc.playlists = [];
			}

			doc.version = 3;
		});
	}

	if (track.version === 3) {
		handle.change((doc) => {
			if (!doc.file.mediaServers) {
				doc.file.mediaServers = [];
			}

			doc.version = 4;
		});
	}
}
