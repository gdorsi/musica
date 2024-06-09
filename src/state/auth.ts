import type { Repo } from "@automerge/automerge-repo";
import { useDocument } from "@automerge/automerge-repo-react-hooks";
import * as idb from "idb-keyval";
import { createContext, useContext, useMemo } from "react";
import * as ucans from "@ucans/ucans";
import { createRepository } from "./repository";

import {
	MusicCollectionSchema,
	MusicCollectionVersion,
	type User,
	type UserDocuments,
	UserDocumentsVersion,
	UserSchema,
	UserVersion,
	DidSchema,
} from "./schema";

export type AuthData = { user: User; repo: Repo };

export function getAuthData() {
	const value = localStorage.getItem("currentUser");

	if (!value) return null;

	const user = UserSchema.parse(JSON.parse(value));
	const repo = createRepository(user.id, user.syncServers);

	return { user, repo };
}

export async function getKeypair(user: User) {
	const keypair = await idb.get(user.id);

	if (!keypair) throw new Error("the keypair is missing!");

	return new ucans.EcdsaKeypair(keypair.keypair, keypair.publicKey, false);
}

export async function registerUser(payload: {
	name: string;
	syncServer: string;
}) {
	const keypair = await ucans.EcdsaKeypair.create();

	const did = DidSchema.parse(keypair.did());
	const repo = createRepository(did, [payload.syncServer]);

	const musicCollection = repo.create(
		MusicCollectionSchema.parse({
			version: MusicCollectionVersion,
			id: crypto.randomUUID(),
			title: "My first collection",
			items: [],
			owner: did,
		}),
	);

	const userDocuments = repo.create<UserDocuments>({
		version: UserDocumentsVersion,
		collectionsUrls: [musicCollection.url],
	});

	const user: User = {
		version: UserVersion,
		id: did,
		name: payload.name,
		syncServers: [payload.syncServer],
		documentsListUrl: userDocuments.url,
	};

	await idb.set(did, keypair);
	localStorage.setItem("currentUser", JSON.stringify(user));

	return { user, repo };
}

export const UserContext = createContext<User | null>(null);
export const useUser = () => {
	const user = useContext(UserContext);

	if (user === null) throw new Error("UserContext.Provider is missing");

	return user;
};
export const useUserDocuments = () => {
	const user = useUser();

	const [documents] = useDocument<UserDocuments>(user.documentsListUrl);

	// TODO: Maybe trigger suspense when the document is undefined?
	return useMemo(
		() =>
			documents ??
			({
				version: "0.0.1",
				collectionsUrls: [],
			} as UserDocuments),
		[documents],
	);
};
