import { Repo } from "@automerge/automerge-repo";
import { createSynServerHttpServer } from "@musica/shared/sync-server/httpServer";

import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";
import { DurableObjectAutomergeWsAdapter } from "./lib/DurableObjectAutomergeWsAdapter";
import { R2MediaStorageAdapter } from "./lib/R2MediaStorageAdapter";
import { createAutomergeRepo } from "./lib/createAutomergeRepo";

/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

/**
 * Associate bindings declared in wrangler.toml with the TypeScript type system
 */
export interface Env {
	SYNC_SERVER_DO: DurableObjectNamespace<SyncServerDurableObject>;
	AUTOMERGE: R2Bucket;
	MEDIA: R2Bucket;
}

/** A Durable Object's behavior is defined in an exported Javascript class */
export class SyncServerDurableObject extends DurableObject {
	app: Hono;
	repo: Repo;
	network: DurableObjectAutomergeWsAdapter;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);

		const { repo, network } = createAutomergeRepo({
			storage: ctx.storage,
		});

		const app = createSynServerHttpServer({
			allowedOrigins: ["*"],
			repo,
			storage: new R2MediaStorageAdapter(env.MEDIA),
		});

		this.app = app;
		this.repo = repo;
		this.network = network;
	}

	async fetch(request: Request) {
		const upgradeHeader = request.headers.get("Upgrade");

		if (
			new URL(request.url).pathname === "/" &&
			upgradeHeader === "websocket"
		) {
			const webSocketPair = new WebSocketPair();
			const [client, server] = Object.values(webSocketPair);

			this.ctx.acceptWebSocket(server);

			return new Response(null, {
				status: 101,
				webSocket: client,
			});
		}

		return this.app.fetch(request);
	}

	webSocketMessage(
		ws: WebSocket,
		message: string | ArrayBuffer,
	): void | Promise<void> {
		if (typeof message === "string") return;

		this.network.receiveMessage(new Uint8Array(message), ws);
	}

	webSocketClose(ws: WebSocket): void | Promise<void> {
		this.network.removeSocket(ws);
	}
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const id = env.SYNC_SERVER_DO.idFromName("automerge");
		const stub = env.SYNC_SERVER_DO.get(id);

		return stub.fetch(request);
	},
} satisfies ExportedHandler<Env>;
