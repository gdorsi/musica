import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Bootstrap } from "./Bootstrap.tsx";

const root = document.getElementById("root");

if (root) {
	ReactDOM.createRoot(root).render(
		<React.StrictMode>
			<Bootstrap />
		</React.StrictMode>,
	);
}
