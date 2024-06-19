import * as ucans from "@ucans/ucans";

import { type Did, type User } from "../data/schema";
import { AuthStorage } from "./lib/storage";

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
