import { isValidAutomergeUrl } from "@automerge/automerge-repo";
import { z } from "zod";

export const MusicFileSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	type: z.string(),
});
export type MusicFile = z.infer<typeof MusicFileSchema>;

export const MusicItemSchema = z.object({
	id: z.string().uuid(),
	file: MusicFileSchema,
	title: z.string(),
	description: z.string(),
});
export type MusicItem = z.infer<typeof MusicItemSchema>;

export const MusicCollectionVersion = "0.0.1";
export const MusicCollectionSchema = z.object({
	id: z.string().uuid(),
	version: z.literal(MusicCollectionVersion),
	title: z.string(),
	items: z.array(MusicItemSchema),
});
export type MusicCollection = z.infer<typeof MusicCollectionSchema>;

export const UserDocumentsVersion = "0.0.1";
export const UserDocumentsSchema = z.object({
	version: z.literal(UserDocumentsVersion),
	collectionsUrls: z.array(z.string().refine(isValidAutomergeUrl)),
});
export type UserDocuments = z.infer<typeof UserDocumentsSchema>;

export const UserVersion = "0.0.1";
export const UserSchema = z.object({
	id: z.string().uuid(),
	version: z.literal(UserVersion),
	documentsListUrl: z.string().refine(isValidAutomergeUrl),
	name: z.string(),
});
export type User = z.infer<typeof UserSchema>;
