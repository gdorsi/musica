import { DocumentId, Repo } from "@automerge/automerge-repo";

import * as ucans from "@ucans/ucans";
import { MusicItemSchema } from "../models/MusicItem";
import { DidSchema } from "../schema";

export async function validateUserAccess(params: {
	auth: string;
	ownerDid: string;
	resource: string;
	relations?: string[];
	permission: "read" | "write";
}) {
	const { relations = [] } = params;

	const response = await ucans.verify(params.auth, {
		// to make sure we're the intended recipient of this UCAN
		audience: await getServiceDid(),
		// capabilities required for this invocation & which owner we expect for each capability
		requiredCapabilities: [
			{
				capability: {
					with: { scheme: "musica", hierPart: params.resource },
					can: { namespace: "musica", segments: [params.permission] },
				},
				rootIssuer: params.ownerDid,
			},
		],
		semantics: {
			canDelegateResource: (parentRes, childRes) => {
				if (parentRes.hierPart === ucans.capability.ability.SUPERUSER) {
					return true;
				}

				if (
					relations.includes(parentRes.hierPart) &&
					childRes.hierPart === params.resource
				) {
					return true;
				}

				return ucans.equalCanDelegate.canDelegateResource(parentRes, childRes);
			},
			canDelegateAbility: ucans.equalCanDelegate.canDelegateAbility,
		},
	});

	return response;
}

export async function validateDocumentAccess(params: {
	auth: string;
	ownerDid: string;
	documentId: DocumentId;
	permission: "read" | "write";
	repo: Repo;
}) {
	const { auth, documentId, ownerDid, permission, repo } = params;
	const response = await validateUserAccess({
		auth,
		resource: documentId,
		permission,
		ownerDid,
	});

	if (response.ok || permission === "write") return response;

	const handle = repo.find(documentId);

	await handle.whenReady(["unavailable", "ready"]);
	const doc = handle.docSync();

	if (!doc) return response;

	// If the user has access to the playlist we want to give access to the related tracks
	if ("type" in doc && doc.type === "track") {
		const track = MusicItemSchema.parse(doc);

		const result = await validateUserAccess({
			auth,
			resource: documentId,
			relations: track.playlists,
			permission,
			ownerDid,
		});

		if (result.ok) {
			return result;
		}
	}

	return response;
}

const keypairPromise = ucans.EcdsaKeypair.create();

export async function getServiceDid() {
	return DidSchema.parse((await keypairPromise).did());
}
