import type { Repo } from "@automerge/automerge-repo";
import { useDocument } from "@automerge/automerge-repo-react-hooks";
import { createContext, useContext, useMemo } from "react";
import {
	MusicCollectionSchema,
	MusicCollectionVersion,
	type User,
	type UserDocuments,
	UserDocumentsVersion,
	UserSchema,
	UserVersion,
} from "./schema";

export function getCurrentUser() {
	const value = localStorage.getItem("currentUser");

	if (!value) return null;

	const user = UserSchema.parse(JSON.parse(value));

	return user;
}

export function registerUser(name: string, repo: Repo) {
	const musicCollection = repo.create(
		MusicCollectionSchema.parse({
			version: MusicCollectionVersion,
			id: crypto.randomUUID(),
			title: "My first collection",
			items: [],
		}),
	);

	const userDocuments = repo.create<UserDocuments>({
		version: UserDocumentsVersion,
		collectionsUrls: [musicCollection.url],
	});

	const user: User = {
		version: UserVersion,
		id: crypto.randomUUID(),
		name,
		documentsListUrl: userDocuments.url,
	};

	localStorage.setItem("currentUser", JSON.stringify(user));

	return user;
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
