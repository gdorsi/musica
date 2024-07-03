import type { Repo } from "@automerge/automerge-repo";
import { createRepository } from "../repository";

import { AuthStorage } from "./lib/storage";
import { User } from "@musica/data/models/User";
import { DidSchema } from "@musica/data/schema";

export type AuthData = { user: User; repo: Repo };

export function getAuthData() {
	const user = AuthStorage.getUserData();

	if (!user) return null;

	const repo = createRepository(user.id, user.syncServers);

	return { user, repo };
}

export async function getSyncServerDid(syncServer: string) {
	const res = await fetch(`http://${syncServer}/auth/did`);

	const { did } = await res.json();

	return DidSchema.parse(did);
}
