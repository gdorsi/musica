// @ts-check
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import type { MediaStorageApi } from "./types";
import { validateUserAccess } from "../auth";

// example did:key:zDnaeq4v2MQp7tQJagJEm9S1726tyk44ftrLdT5yaSu1aKdAW
const didRe = /^did:key:[a-zA-Z0-9]{49}$/;
const didSchema = z.string().refine((string) => Boolean(string.match(didRe)));

async function hasAccessToResource(params: {
	auth: string | undefined;
	ownerDid: string;
	resource: string;
	permission: "read" | "write";
}) {
	return validateUserAccess({
		...params,
		auth: params.auth?.replace(`Bearer `, "") ?? "",
	});
}

type MediaServerConfig = {
	storage: MediaStorageApi;
	app: Hono;
};

export function addMediaServerRoutes({ storage, app }: MediaServerConfig) {
	const MediaGetSchema = z.object({
		id: z.string().uuid(),
		user: didSchema,
	});

	app.get(
		"/media/:user/:id",
		zValidator("param", MediaGetSchema),
		async (c) => {
			const data = c.req.valid("param");

			const auth = await hasAccessToResource({
				auth: c.req.header("Authorization"),
				ownerDid: data.user,
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
