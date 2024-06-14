// @ts-check
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import * as ucans from "@ucans/ucans";
import { HTTPException } from "hono/http-exception";
import type { MediaStorageApi } from "./types";

type MediaServerConfig = {
	storage: MediaStorageApi;
	allowedOrigins: string[];
};

// example did:key:zDnaeq4v2MQp7tQJagJEm9S1726tyk44ftrLdT5yaSu1aKdAW
const didRe = /^did:key:[a-zA-Z0-9]{49}$/;
const didSchema = z.string().refine((string) => Boolean(string.match(didRe)));

async function hasAccessToResource(params: {
	auth: string | undefined;
	ownerDid: string;
	serviceDid: string;
	resource: string;
	permission: "read" | "write";
}) {
	const token = params.auth?.replace(`Bearer `, "") ?? "";

	const response = await ucans.verify(token, {
		// to make sure we're the intended recipient of this UCAN
		audience: params.serviceDid,
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

export async function createMediaServer({
	storage,
	allowedOrigins,
}: MediaServerConfig) {
	const app = new Hono();
	const keypair = await ucans.EcdsaKeypair.create();
	const serviceDid = keypair.did();

	app.get("/", (c) => {
		return c.text("👍 @musica/sync-server is running");
	});

	const corsPolicy = cors({
		origin: allowedOrigins.join(","),
		allowMethods: ["POST", "PUT", "GET", "OPTIONS"],
		allowHeaders: ["Authorization", "Content-type"],
	});

	app.use("/*", corsPolicy);

	const MediaGetSchema = z.object({
		id: z.string().uuid(),
		user: didSchema,
	});

	app.get("/media/did", (c) => {
		return c.json({ did: serviceDid });
	});

	app.get(
		"/media/:user/:id",
		zValidator("param", MediaGetSchema),
		async (c) => {
			const data = c.req.valid("param");

			const auth = await hasAccessToResource({
				auth: c.req.header("Authorization"),
				ownerDid: data.user,
				serviceDid,
				permission: "read",
				resource: `media/${data.id}`,
			});

			if (!auth.ok) {
				throw new HTTPException(401, {
					message: auth.error.join(" | ") || "Error: Access not allowed",
				});
			}

			try {
				return c.body(await storage.getFile(data.user, data.id));
			} catch (err) {
				return c.notFound();
			}
		},
	);

	const MediaSyncSchema = z.object({
		list: z.array(z.string().uuid()),
		user: didSchema,
	});

	app.post(
		"/media/sync-check",
		zValidator("json", MediaSyncSchema),
		async (c) => {
			const data = c.req.valid("json");

			const auth = await hasAccessToResource({
				auth: c.req.header("Authorization"),
				ownerDid: data.user,
				serviceDid,
				permission: "read",
				resource: `media/sync-check`,
			});

			if (!auth.ok) {
				throw new HTTPException(401, {
					message: auth.error.join(" | ") || "Error: Access not allowed",
				});
			}

			const missing = new Set(data.list);
			const found = new Set();

			try {
				const files = await storage.listUserFiles(data.user);

				for (const file of files) {
					missing.delete(file);
					found.add(file);
				}

				return c.json({
					missing: Array.from(missing),
					found: Array.from(found),
				});
			} catch (err) {
				c.notFound();
			}
		},
	);

	const MediaPutSchema = z.object({
		id: z.string().uuid(),
		user: didSchema,
	});

	app.put(
		"/media/:user/:id",
		zValidator("param", MediaPutSchema),
		async (c) => {
			const data = c.req.valid("param");

			const auth = await hasAccessToResource({
				auth: c.req.header("Authorization"),
				ownerDid: data.user,
				serviceDid,
				permission: "write",
				resource: `media/${data.id}`,
			});

			if (!auth.ok) {
				throw new HTTPException(401, {
					message: auth.error.join(" | ") || "Error: Access not allowed",
				});
			}

			const blob = await c.req.blob();

			try {
				await storage.storeFile(data.user, data.id, blob);

				return c.json({
					success: true,
				});
			} catch (err) {
				return c.notFound();
			}
		},
	);

	return app;
}
