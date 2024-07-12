// @ts-check
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { validateDocumentAccess } from "../auth";
import { DocumentId, Repo } from "@automerge/automerge-repo";
import { getDocumentOwner } from "../../automerge/getDocumentOwner";
import { MediaStorageApi } from "../../mediaStorage";
import { DocumentIdSchema } from "../../schema";

async function hasAccessToResource(params: {
	repo: Repo;
	auth: string | undefined;
	documentId: DocumentId;
	permission: "read" | "write";
}) {
	const repo = params.repo;
	const ownerDid = await getDocumentOwner(repo, params.documentId);

	if (!ownerDid) return { ok: false, error: ["Can't get the document owner"] };

	return validateDocumentAccess({
		ownerDid,
		permission: params.permission,
		documentId: params.documentId,
		auth: params.auth?.replace(`Bearer `, "") ?? "",
		repo,
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
		id: DocumentIdSchema,
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
			const blob = await storage.getFile(data.id);
			return c.body(await blob.arrayBuffer());
		} catch (err) {
			return c.notFound();
		}
	});

	const MediaPutSchema = z.object({
		id: DocumentIdSchema,
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
