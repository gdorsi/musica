import { DocumentId } from "@automerge/automerge-repo";
import { z } from "zod";
import { Did, DidSchema, DocumentIdSchema } from "../schema";

export const UserVersion = 1;
export const UserSchema = z.object({
	id: DidSchema,
	version: z.literal(UserVersion),
	rootDocument: DocumentIdSchema,
	syncServers: z.array(z.string()),
});
export type User = z.infer<typeof UserSchema>;

export function createUser(
	id: Did,
	rootDocument: DocumentId,
	syncServers: string[],
) {
	const user: User = {
		version: UserVersion,
		id,
		rootDocument,
		syncServers,
	};

	return user;
}
