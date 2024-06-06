import { RepoContext } from "@automerge/automerge-repo-react-hooks";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createRepository } from "./state/repository.ts";

const { repo } = createRepository();

const root = document.getElementById("root");

if (root) {
	ReactDOM.createRoot(root).render(
		<React.StrictMode>
			<RepoContext.Provider value={repo}>
				<App />
			</RepoContext.Provider>
		</React.StrictMode>,
	);
}
