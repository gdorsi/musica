import { RepoContext } from "@automerge/automerge-repo-react-hooks";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createRepository, getDocumentsURLs } from "./state/repository.ts";

const { repo } = createRepository();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RepoContext.Provider value={repo}>
      <App documents={getDocumentsURLs(repo)} />
    </RepoContext.Provider>
  </React.StrictMode>
);
