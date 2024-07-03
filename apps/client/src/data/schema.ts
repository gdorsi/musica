import { z } from "zod";
import { DocumentIdSchema } from "@musica/data/schema";

export const JoinDevicePayloadSchema = z.object({
	u: z.string(), // ucan delegation
	d: DocumentIdSchema, // root document url
	s: z.string(), // sync server
});

export const SharePlaylistPayloadSchema = z.object({
	u: z.string(), // ucan delegation
	d: DocumentIdSchema, // document url
});
