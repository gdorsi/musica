import { serve } from "@hono/node-server";
import { createMediaServer } from "./MediaServer";
import { NodeFSMediaStorageAdapter } from "./NodeFSMediaStorageAdapter";
import { WebSocketServer } from "ws";
import { createAutomergeRepo } from "./AutomergeRepo";

const app = await createMediaServer({
	storage: new NodeFSMediaStorageAdapter("storage/media"),
	allowedOrigins: ["*"],
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
