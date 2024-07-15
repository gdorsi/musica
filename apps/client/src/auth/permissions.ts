import * as ucans from "@ucans/ucans";

import { AuthStorage } from "./lib/storage";
import { DocumentId } from "@automerge/automerge-repo";
import { User } from "@musica/shared/models/User";
import { Did } from "@musica/shared/schema";

export async function getResourceDelegation(
	userId: User["id"],
	serviceDid: Did,
	resource: string,
	permission: "read" | "write",
) {
	const keypair = await AuthStorage.getKeypair(userId);
	const proofs = await AuthStorage.getUcanProofs();

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
				can: {
					namespace: "musica",
					segments: [permission],
				},
			},
		],
		proofs,
	});

	return ucans.encode(ucan);
}

export async function getPlaylistSharingDelegation(
	userId: User["id"],
	target: Did,
	playlistId: DocumentId,
) {
	const keypair = await AuthStorage.getKeypair(userId);
	const proofs = await AuthStorage.getUcanProofs();

	const ucan = await ucans.build({
		issuer: keypair,
		audience: target,
		addNonce: true,
		expiration: new Date("3023/11/27").getTime(),
		capabilities: [
			{
				with: {
					scheme: "musica",
					hierPart: playlistId,
				},
				can: {
					namespace: "musica",
					segments: ["read"],
				},
			},
		],
		proofs,
	});

	return ucans.encode(ucan);
}

export async function getDeviceDelegation(userId: User["id"], target: Did) {
	const keypair = await AuthStorage.getKeypair(userId);
	const proofs = await AuthStorage.getUcanProofs();

	const ucan = await ucans.build({
		issuer: keypair,
		audience: target,
		// A device invitation never expires
		expiration: new Date("3023/11/27").getTime(),
		capabilities: [
			ucans.capability.my(ucans.SUPERUSER),
			ucans.capability.prf(ucans.SUPERUSER, ucans.SUPERUSER),
		],
		proofs,
	});

	return ucans.encode(ucan);
}
