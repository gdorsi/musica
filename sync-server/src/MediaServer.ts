// @ts-check
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { MediaStorageApi } from "./types";

type MediaServerConfig = {
	storage: MediaStorageApi;
	allowedOrigins: string[];
};

// example did:key:zDnaeq4v2MQp7tQJagJEm9S1726tyk44ftrLdT5yaSu1aKdAW
const didRe = /^did:key:[a-zA-Z0-9]{49}$/;
const didSchema = z.string().refine((string) => Boolean(string.match(didRe)));

export async function createMediaServer({
	storage,
	allowedOrigins,
}: MediaServerConfig) {
	const app = new Hono();
	app.get("/", (c) => {
		return c.text("👍 @musica/sync-server is running");
	});

	const corsPolicy = cors({
		origin: allowedOrigins.join(","),
		allowMethods: ["POST", "PUT", "GET", "OPTIONS"],
		allowHeaders: ["Content-type"],
	});

	app.use("/*", corsPolicy);

	const MediaGetSchema = z.object({
		id: z.string().uuid(),
		user: didSchema,
	});

	app.get(
		"/media/:user/:id",
		zValidator("param", MediaGetSchema),
		async (c) => {
			const data = c.req.valid("param");

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
