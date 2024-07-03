import { type PeerId } from "@automerge/automerge-repo";
import { isValidDocumentId } from "@automerge/automerge-repo/dist/AutomergeUrl";
import { z } from "zod";

// example did:key:zDnaeq4v2MQp7tQJagJEm9S1726tyk44ftrLdT5yaSu1aKdAW
const didRe = /^did:key:[a-zA-Z0-9]{49}$/;

export const DidSchema = z
	.string()
	.refine((value): value is PeerId => didRe.test(value)); // We use DID as PeerId for automerge

export type Did = z.infer<typeof DidSchema>;

export const DocumentIdSchema = z.string().refine(isValidDocumentId);
