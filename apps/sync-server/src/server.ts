import { Hono } from "hono";
import { cors } from "hono/cors";

type HttpServerConfig = {
	allowedOrigins: string[];
};

export function createServer({ allowedOrigins }: HttpServerConfig) {
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

	return app;
}
