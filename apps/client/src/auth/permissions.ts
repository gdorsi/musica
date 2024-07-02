import * as ucans from "@ucans/ucans";

import { AuthStorage } from "./lib/storage";
import { DocumentId } from "@automerge/automerge-repo";
import { User } from "@/data/models/User";
import { Did } from "@/data/schema";

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
	tracks: DocumentId[],
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
			...tracks.map((id) => ({
				with: {
					scheme: "musica",
					hierPart: id,
				},
				can: {
					namespace: "musica",
					segments: ["read"],
				},
			})),
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
			{
				with: {
					scheme: "musica",
					hierPart: ucans.capability.ability.SUPERUSER,
				},
				can: ucans.capability.ability.SUPERUSER,
			},
		],
		proofs,
	});

	return ucans.encode(ucan);
}
