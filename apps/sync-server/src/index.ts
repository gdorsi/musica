import { serve } from "@hono/node-server";
import { addMediaServerRoutes } from "./media/MediaServer";
import { NodeFSMediaStorageAdapter } from "./media/NodeFSMediaStorageAdapter";
import { WebSocketServer } from "ws";
import { createAutomergeRepo } from "./automerge";
import { createServer } from "./server";
import { addAuthRoutes } from "./auth";

const app = createServer({ allowedOrigins: ["*"] });

addMediaServerRoutes({
	storage: new NodeFSMediaStorageAdapter("storage/media"),
	app,
});

addAuthRoutes({
	app,
});

const server = serve(app, (info) => {
	console.log(`Listening on ${JSON.stringify(info)}`);
});

const webSocketServer = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
	webSocketServer.handleUpgrade(request, socket, head, (socket) => {
		webSocketServer.emit("connection", socket, request);
	});
});

createAutomergeRepo({ socket: webSocketServer, dir: "storage/automerge" });
