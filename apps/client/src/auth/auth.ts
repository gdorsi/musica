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

async function _getSyncServerDid(syncServer: string) {
	const res = await fetch(`${location.protocol}//${syncServer}/auth/did`);

	const { did } = await res.json();

	return DidSchema.parse(did);
}

const didCache: Record<string, Promise<PeerId> | undefined> = {};
export async function getSyncServerDid(syncServer: string) {
	const cached = didCache[syncServer];
	if (cached) return cached;

	const promise = _getSyncServerDid(syncServer);
	didCache[syncServer] = promise;

	try {
		return await promise;
	} catch (err) {
		didCache[syncServer] = undefined;
		throw err;
	}
}
