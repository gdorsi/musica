import { z } from "zod";
import { Did, DidSchema } from "../schema";
import { DocumentId, Repo } from "@automerge/automerge-repo";
import { getAudioFileData } from "@/audio/getAudioFileData";
import { copyToPrivateFileSystem, deleteFile } from "../storage/opfs";

export const MusicFileSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	type: z.string(),
});
export type MusicFile = z.infer<typeof MusicFileSchema>;

export const MusicItemVersion = 1;
export const MusicItemSchema = z.object({
	id: z.string().uuid(),
	file: MusicFileSchema,
	title: z.string(),
	description: z.string(),
	duration: z.number(),
	waveform: z.array(z.number()),
	version: z.literal(MusicItemVersion),
	owner: DidSchema,
});

export type MusicItem = z.infer<typeof MusicItemSchema>;

export async function createMusicItem(repo: Repo, file: File, owner: Did) {
	const data = await getAudioFileData(file);

	const item: MusicItem = {
		id: crypto.randomUUID(),
		title: file.name,
		description: "",
		duration: data.duration,
		waveform: data.waveform,
		owner,
		version: MusicItemVersion,
		file: {
			id: crypto.randomUUID(),
			name: file.name,
			type: file.type,
		},
	};

	await copyToPrivateFileSystem(item.file.id, file);

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

export async function deleteMusicItem(repo: Repo, documentId: DocumentId) {
	const handle = repo.find<MusicItem>(documentId);

	const item = handle.docSync();

	if (item) {
		await deleteFile(item.file.id);
	}

	repo.delete(documentId);
}
