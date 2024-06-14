import type { Repo } from "@automerge/automerge-repo";
import { createRepository } from "../repository";

import { type User } from "../data/schema";
import { AuthStorage } from "./lib/storage";

export type AuthData = { user: User; repo: Repo };

export function getAuthData() {
	const user = AuthStorage.getUserData();

	if (!user) return null;

	const repo = createRepository(user.id, user.syncServers);

	return { user, repo };
}
