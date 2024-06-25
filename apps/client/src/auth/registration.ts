import * as ucans from "@ucans/ucans";
import { createRepository } from "../repository";

import {
	type User,
	type RootDocument,
	RootDocumentVersion,
	UserVersion,
	DidSchema,
	type Did,
	JoinDevicePayloadSchema,
} from "../data/schema";
import { AuthStorage } from "./lib/storage";
import { getDeviceDelegation } from "./permissions";

export async function registerUser(payload: {
	name: string;
	syncServer?: string | undefined;
}) {
	const keypair = await ucans.EcdsaKeypair.create();
	const syncServers = payload.syncServer ? [payload.syncServer] : [];

	const did = DidSchema.parse(keypair.did());
	const repo = createRepository(did, syncServers);

	const rootDocument = repo.create<RootDocument>({
		version: RootDocumentVersion,
		tracks: [],
		playlists: [],
		name: payload.name,
		owner: did,
	});

	const user: User = {
		version: UserVersion,
		id: did,
		rootDocument: rootDocument.documentId,
		syncServers,
	};

	await AuthStorage.storeUserData(user);
	await AuthStorage.storeKeypair(user.id, keypair);

	return { user, repo };
}

export async function generateInvitationURL(user: User, target: Did) {
	const url = new URL(location.origin);

	const ucan = await getDeviceDelegation(user.id, target);

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

	await AuthStorage.storeTempJoinKeypair(keypair);

	return keypair;
}

export async function joinDevice(invitation: string) {
	const keypair = await AuthStorage.getTempJoinKeypair();
	const payload = JoinDevicePayloadSchema.parse(
		JSON.parse(decodeURIComponent(invitation)),
	);

	const did = DidSchema.parse(keypair.did());
	const repo = createRepository(did, [payload.s]);

	await ucans.validate(payload.u);
	await AuthStorage.storeUcanProof(payload.u);

	const rootDocument = repo.find<RootDocument>(payload.d);

	const user: User = {
		version: UserVersion,
		id: did,
		rootDocument: rootDocument.documentId,
		syncServers: [payload.s],
	};

	await AuthStorage.storeUserData(user);
	await AuthStorage.storeKeypair(user.id, keypair);
	await AuthStorage.cleanTempJoinKeypair();

	return true;
}
