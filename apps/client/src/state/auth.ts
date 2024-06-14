import type { Repo } from "@automerge/automerge-repo";
import { useDocument } from "@automerge/automerge-repo-react-hooks";
import * as idb from "idb-keyval";
import { createContext, useContext } from "react";
import * as ucans from "@ucans/ucans";
import { createRepository } from "./repository";

import {
	MusicCollectionSchema,
	MusicCollectionVersion,
	type User,
	type RootDocument,
	RootDocumentVersion,
	UserSchema,
	UserVersion,
	DidSchema,
	type Did,
	JoinDevicePayloadSchema,
} from "./schema";

export type AuthData = { user: User; repo: Repo };

export function getAuthData() {
	const value = localStorage.getItem("currentUser");

	if (!value) return null;

	const user = UserSchema.parse(JSON.parse(value));
	const repo = createRepository(user.id, user.syncServers);

	return { user, repo };
}

async function getKeypairFromStorage(key: string) {
	const keypair = await idb.get(key);

	if (!keypair) throw new Error("the keypair is missing!");

	return new ucans.EcdsaKeypair(keypair.keypair, keypair.publicKey, false);
}

export async function registerUser(payload: {
	name: string;
	syncServer?: string | undefined;
}) {
	const keypair = await ucans.EcdsaKeypair.create();
	const syncServers = payload.syncServer ? [payload.syncServer] : [];

	const did = DidSchema.parse(keypair.did());
	const repo = createRepository(did, syncServers);

	const musicCollection = repo.create(
		MusicCollectionSchema.parse({
			version: MusicCollectionVersion,
			id: crypto.randomUUID(),
			items: [],
			owner: did,
		}),
	);

	const rootDocument = repo.create<RootDocument>({
		version: RootDocumentVersion,
		musicCollection: musicCollection.url,
		playlists: [],
		name: payload.name,
		owner: did,
	});

	const user: User = {
		version: UserVersion,
		id: did,
		rootDocument: rootDocument.url,
		syncServers,
	};

	await idb.set(did, keypair);
	storeUserData(user);

	return { user, repo };
}

export function storeUserData(user: User) {
	localStorage.setItem("currentUser", JSON.stringify(UserSchema.parse(user)));
}

export const UserContext = createContext<User | null>(null);
export const useUser = () => {
	const user = useContext(UserContext);

	if (user === null) throw new Error("UserContext.Provider is missing");

	return user;
};
export const useRootDocument = () => {
	const user = useUser();

	const [rootDocument] = useDocument<RootDocument>(user.rootDocument);

	// TODO: Maybe trigger suspense when the document is undefined?
	return rootDocument;
};

export async function getAuthToken(
	user: User,
	serviceDid: Did,
	resource: string,
) {
	const keypair = await getKeypairFromStorage(user.id);

	const proof = await idb.get("ucan-proof");

	const ucan = await ucans.build({
		issuer: keypair,
		audience: serviceDid,
		addNonce: true,
		lifetimeInSeconds: 300, // Valid for 2 minutes
		capabilities: [
			{
				with: {
					scheme: "musica",
					hierPart: resource,
				},
				can: ucans.capability.ability.SUPERUSER,
			},
		],
		proofs: [proof].filter(Boolean),
	});

	return ucans.encode(ucan);
}

async function buildAddDeviceUcan(user: User, target: Did) {
	const keypair = await getKeypairFromStorage(user.id);

	const proof = await idb.get("ucan-proof");

	const ucan = await ucans.build({
		issuer: keypair,
		audience: target,
		// A device invitation never expires
		expiration: new Date("3023/11/27").getTime(),
		capabilities: [
			{
				with: {
					scheme: "musica",
					hierPart: ucans.capability.ability.SUPERUSER,
				},
				can: ucans.capability.ability.SUPERUSER,
			},
		],
		proofs: [proof].filter(Boolean),
	});

	return ucans.encode(ucan);
}

export async function generateInvitationURL(user: User, target: Did) {
	const url = new URL(location.origin);

	const ucan = await buildAddDeviceUcan(user, target);

	url.search = "join";
	url.hash = encodeURIComponent(
		JSON.stringify(
			JoinDevicePayloadSchema.parse({
				u: ucan,
				d: user.rootDocument,
				// TODO: move the sync servers to rootDocument?
				s: user.syncServers[0],
			}),
		),
	);

	return url.toString();
}

export async function createJoinKeypair() {
	const keypair = await ucans.EcdsaKeypair.create();

	await idb.set("joinKeypair", keypair);

	return keypair;
}

export async function joinDevice(invitation: string) {
	const keypair = await getKeypairFromStorage("joinKeypair");
	const payload = JoinDevicePayloadSchema.parse(
		JSON.parse(decodeURIComponent(invitation)),
	);

	const did = DidSchema.parse(keypair.did());
	const repo = createRepository(did, [payload.s]);

	await ucans.validate(payload.u);
	await idb.set("ucan-proof", payload.u);

	const rootDocument = repo.find<RootDocument>(payload.d);

	const user: User = {
		version: UserVersion,
		id: did,
		rootDocument: rootDocument.url,
		syncServers: [payload.s],
	};

	await idb.set(did, keypair);
	storeUserData(user);

	await idb.del("joinKeypair");

	return true;
}
