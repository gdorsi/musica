import { type PeerId } from "@automerge/automerge-repo";
import { isValidDocumentId } from "@automerge/automerge-repo/dist/AutomergeUrl";
import { z } from "zod";

// example did:key:zDnaeq4v2MQp7tQJagJEm9S1726tyk44ftrLdT5yaSu1aKdAW
const didRe = /^did:key:[a-zA-Z0-9]{49}$/;

export const DidSchema = z
	.string()
	.refine((value): value is PeerId => didRe.test(value)); // We use DID as PeerId for automerge

export type Did = z.infer<typeof DidSchema>;

const DocumentIdSchema = z.string().refine(isValidDocumentId);

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

export const PlaylistVersion = 1;
export const PlaylistSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	version: z.literal(PlaylistVersion),
	tracks: z.array(DocumentIdSchema),
	owner: DidSchema,
});
export type Playlist = z.infer<typeof PlaylistSchema>;

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

export const UserVersion = 1;
export const UserSchema = z.object({
	id: DidSchema,
	version: z.literal(UserVersion),
	rootDocument: DocumentIdSchema,
	syncServers: z.array(z.string()),
});
export type User = z.infer<typeof UserSchema>;

export const JoinDevicePayloadSchema = z.object({
	u: z.string(), // ucan delegation
	d: DocumentIdSchema, // root document url
	s: z.string(), // sync server
});
