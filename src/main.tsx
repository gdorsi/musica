import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./global.css";
import { Router } from "./Router.tsx";
import { getAuthData, joinDevice } from "./state/auth.ts";
import { Toaster } from "sonner";

const root = document.getElementById("root");

if (location.hash && location.search === "?join") {
	await joinDevice(location.hash.slice(1));
	location.href = "/";
} else if (import.meta.env.DEV) {
	try {
		getAuthData(); // On dev check if we have a valid user
	} catch (err) {
		localStorage.removeItem("currentUser"); // if not, reset the auth state
	}
}

if (root) {
	ReactDOM.createRoot(root).render(
		<React.StrictMode>
			<Router />
			<Toaster />
		</React.StrictMode>,
	);
}
