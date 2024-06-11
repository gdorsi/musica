import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./global.css";
import { Router } from "./Router.tsx";

const root = document.getElementById("root");

if (root) {
	ReactDOM.createRoot(root).render(
		<React.StrictMode>
			<Router />
		</React.StrictMode>,
	);
}
