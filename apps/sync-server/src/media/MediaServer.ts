// @ts-check
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import type { MediaStorageApi } from "./types";
import { validateUserAccess } from "../auth";
import { DocumentId, Repo } from "@automerge/automerge-repo";
import { getDocumentOwner } from "@musica/automerge-helpers/lib/getDocumentOwner";
import { isValidDocumentId } from "@automerge/automerge-repo/dist/AutomergeUrl";

const documentIdSchema = z.string().refine(isValidDocumentId);

async function hasAccessToResource(params: {
	repo: Repo;
	auth: string | undefined;
	documentId: string;
	permission: "read" | "write";
}) {
	const ownerDid = await getDocumentOwner(params.repo, params.documentId);

	if (!ownerDid) return { ok: false, error: ["Can't get the document owner"] };

	return validateUserAccess({
		ownerDid,
		permission: params.permission,
		resource: `media/${params.documentId}`,
		auth: params.auth?.replace(`Bearer `, "") ?? "",
	});
}

type MediaServerConfig = {
	storage: MediaStorageApi;
	app: Hono;
	repo: Repo;
};

export function addMediaServerRoutes({
	storage,
	app,
	repo,
}: MediaServerConfig) {
	const MediaGetSchema = z.object({
		id: documentIdSchema,
	});

	app.get("/media/:id", zValidator("param", MediaGetSchema), async (c) => {
		const data = c.req.valid("param");

		const auth = await hasAccessToResource({
			auth: c.req.header("Authorization"),
			documentId: data.id,
			permission: "read",
			repo,
		});

		if (!auth.ok) {
			throw new HTTPException(401, {
				message: auth.error.join(" | ") || "Error: Access not allowed",
			});
		}

		try {
			return c.body(await storage.getFile(data.id));
		} catch (err) {
			return c.notFound();
		}
	});

	const MediaSyncSchema = z.object({
		documentId: documentIdSchema,
	});

	app.post(
		"/media/sync-check",
		zValidator("json", MediaSyncSchema),
		async (c) => {
			const data = c.req.valid("json");

			const auth = await hasAccessToResource({
				auth: c.req.header("Authorization"),
				documentId: data.documentId,
				permission: "read",
				repo,
			});

			if (!auth.ok) {
				throw new HTTPException(401, {
					message: auth.error.join(" | ") || "Error: Access not allowed",
				});
			}

			const doc = repo.find<{ tracks: DocumentId[] }>(data.documentId);

			await doc.whenReady(["ready", "unavailable"]);

			const tracks = doc.docSync()?.tracks;

			if (!tracks) {
				throw new HTTPException(404, {
					message: "Document not found",
				});
			}

			const missing = new Set();

			for (const id of tracks) {
				if (!(await storage.fileExist(id))) {
					missing.add(id);
				}
			}

			return c.json({
				missing: Array.from(missing),
			});
		},
	);

	const MediaPutSchema = z.object({
		id: documentIdSchema,
	});

	app.put("/media/:id", zValidator("param", MediaPutSchema), async (c) => {
		const data = c.req.valid("param");

		const auth = await hasAccessToResource({
			auth: c.req.header("Authorization"),
			documentId: data.id,
			permission: "write",
			repo,
		});

		if (!auth.ok) {
			throw new HTTPException(401, {
				message: auth.error.join(" | ") || "Error: Access not allowed",
			});
		}

		const blob = await c.req.blob();

		try {
			await storage.storeFile(data.id, blob);

			return c.json({
				success: true,
			});
		} catch (err) {
			return c.notFound();
		}
	});

	return app;
}
