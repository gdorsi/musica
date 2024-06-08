import { RepoContext } from "@automerge/automerge-repo-react-hooks";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./global.css";
import { createRepository } from "./state/repository.ts";
import { Router } from "./Router.tsx";

const { repo } = createRepository();

const root = document.getElementById("root");

if (root) {
	ReactDOM.createRoot(root).render(
		<React.StrictMode>
			<RepoContext.Provider value={repo}>
				<Router />
			</RepoContext.Provider>
		</React.StrictMode>,
	);
}
