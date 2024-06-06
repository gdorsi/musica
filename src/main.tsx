import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import "./index.css";
import { fireproof } from "use-fireproof";
import { connect } from "@fireproof/aws";

const root = document.getElementById("root");

const db = fireproof("musicCollection");
const cx = connect.awsFree(db);

await cx.loaded;

if (root) {
	ReactDOM.createRoot(root).render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	);
}
