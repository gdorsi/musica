import { Hono } from "hono";
import { cors } from "hono/cors";
import { addMediaServerRoutes } from "./mediaServer";
import { MediaStorageApi } from "../../mediaStorage";
import { Repo } from "@automerge/automerge-repo";
import { getServiceDid } from "../auth";

type HttpServerConfig = {
	allowedOrigins: string[];
	storage: MediaStorageApi;
	repo: Repo;
};

export function createSynServerHttpServer({
	allowedOrigins,
	storage,
	repo,
}: HttpServerConfig) {
	const app = new Hono();

	app.get("/", (c) => {
		return c.text("👍 @musica/sync-server is running");
	});

	const corsPolicy = cors({
		origin: allowedOrigins.join(","),
		allowMethods: ["POST", "PUT", "GET", "OPTIONS"],
		allowHeaders: ["Authorization", "Content-type"],
	});

	app.use("/*", corsPolicy);

	app.get("/auth/did", async (c) => {
		return c.json({ did: await getServiceDid() });
	});

	addMediaServerRoutes({
		app,
		storage,
		repo,
	});

	return app;
}
