import { DidSchema } from "@musica/data/schema";
import * as ucans from "@ucans/ucans";
import { Hono } from "hono";

export async function validateUserAccess(params: {
	auth: string;
	ownerDid: string;
	resource: string;
	permission: "read" | "write";
}) {
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

				return ucans.equalCanDelegate.canDelegateResource(parentRes, childRes);
			},
			canDelegateAbility: ucans.equalCanDelegate.canDelegateAbility,
		},
	});

	return response;
}

const keypairPromise = ucans.EcdsaKeypair.create();

export async function getServiceDid() {
	return DidSchema.parse((await keypairPromise).did());
}

export function addAuthRoutes({ app }: { app: Hono }) {
	app.get("/auth/did", async (c) => {
		return c.json({ did: await getServiceDid() });
	});
}
