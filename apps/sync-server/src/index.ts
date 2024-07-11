import { serve } from "@hono/node-server";
import { createSynServerHttpServer } from "@musica/shared/sync-server/httpServer";
import { NodeFSMediaStorageAdapter } from "lib/NodeFSMediaStorageAdapter";
import { createAutomergeRepo } from "lib/createAutomergeRepo";
import { WebSocketServer } from "ws";

const webSocketServer = new WebSocketServer({ noServer: true });
const repo = await createAutomergeRepo({
	socket: webSocketServer,
	dir: "storage/automerge",
});

const app = createSynServerHttpServer({
	allowedOrigins: ["*"],
	repo,
	storage: new NodeFSMediaStorageAdapter("storage/media"),
});

const server = serve(app, (info) => {
	console.log(`Listening on ${JSON.stringify(info)}`);
});

server.on("upgrade", (request, socket, head) => {
	webSocketServer.handleUpgrade(request, socket, head, (socket) => {
		webSocketServer.emit("connection", socket, request);
	});
});
