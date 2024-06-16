import { type PeerId, isValidAutomergeUrl } from "@automerge/automerge-repo";
import { z } from "zod";

export const DidSchema = z.string().refine((_): _ is PeerId => true); // We use DID as PeerId for automerge
export type Did = z.infer<typeof DidSchema>;

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
	duration: z.number(),
	waveform: z.array(z.number()),
});
export type MusicItem = z.infer<typeof MusicItemSchema>;

export const MusicCollectionVersion = "0.0.1";
export const MusicCollectionSchema = z.object({
	id: z.string().uuid(),
	version: z.literal(MusicCollectionVersion),
	items: z.array(MusicItemSchema),
	owner: DidSchema,
});
export type MusicCollection = z.infer<typeof MusicCollectionSchema>;

export const RootDocumentVersion = "0.0.1";
export const RootDocumentSchema = z.object({
	version: z.literal(RootDocumentVersion),
	musicCollection: z.string().refine(isValidAutomergeUrl),
	// Not implemented yet
	playlists: z.array(z.string().refine(isValidAutomergeUrl)),
	name: z.string(),
	owner: DidSchema,
});
export type RootDocument = z.infer<typeof RootDocumentSchema>;

export const UserVersion = "0.0.1";
export const UserSchema = z.object({
	id: DidSchema,
	version: z.literal(UserVersion),
	rootDocument: z.string().refine(isValidAutomergeUrl),
	syncServers: z.array(z.string()),
});
export type User = z.infer<typeof UserSchema>;

export const JoinDevicePayloadSchema = z.object({
	u: z.string(),
	d: z.string().refine(isValidAutomergeUrl),
	s: z.string(),
});
