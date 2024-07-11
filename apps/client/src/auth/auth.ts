import type { PeerId, Repo } from "@automerge/automerge-repo";
import { createRepository } from "../repository";

import { AuthStorage } from "./lib/storage";
import { User } from "@musica/shared/models/User";
import { DidSchema } from "@musica/shared/schema";
import { migrateAllData } from "@musica/shared/models/RootDocument";

export type AuthData = { user: User; repo: Repo };

export function getAuthData() {
	const user = AuthStorage.getUserData();

	if (!user) return null;

	const repo = createRepository(user.id, user.syncServers);

	migrateAllData(repo, user.rootDocument);

	return { user, repo };
}

const didCache: Record<string, PeerId> = {};

export async function getSyncServerDid(syncServer: string) {
	if (didCache[syncServer]) return didCache[syncServer];

	const res = await fetch(`${location.protocol}//${syncServer}/auth/did`);

	const { did } = await res.json();

	const parsed = DidSchema.parse(did);

	didCache[syncServer] = parsed;

	return parsed;
}
