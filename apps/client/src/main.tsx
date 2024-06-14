import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./global.css";
import { Router } from "./Router.tsx";
import { Toaster } from "sonner";
import { joinDevice } from "./auth/registration.ts";

const root = document.getElementById("root");

if (location.hash && location.search === "?join") {
	await joinDevice(location.hash.slice(1));
	location.href = "/";
}

if (root) {
	ReactDOM.createRoot(root).render(
		<React.StrictMode>
			<Router />
			<Toaster />
		</React.StrictMode>,
	);
}
