import type { Repo } from "@automerge/automerge-repo";
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

export async function getSyncServerDid(syncServer: string) {
	const res = await fetch(`${location.protocol}://${syncServer}/auth/did`);

	const { did } = await res.json();

	return DidSchema.parse(did);
}
