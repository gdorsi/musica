import { useState } from "react";
import { RepoContext } from "@automerge/automerge-repo-react-hooks";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Home } from "./ui/pages/Home";
import { Registration } from "./ui/pages/Registration";
import { getAuthData } from "./auth/auth";
import { UserContext } from "./auth/useUser";
import { Playlist } from "./ui/pages/Playlist";
import { ActiveTrackProvider } from "./audio/ActiveTrackState";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Home />,
	},
	{
		path: "/playlist/:documentId",
		element: <Playlist />,
	},
]);

export function Router() {
	const [auth, setAuth] = useState(getAuthData);

	if (!auth) {
		return <Registration onSuccess={setAuth} />;
	}

	return (
		<UserContext.Provider value={auth.user}>
			<RepoContext.Provider value={auth.repo}>
				<ActiveTrackProvider>
					<RouterProvider router={router} />
				</ActiveTrackProvider>
			</RepoContext.Provider>
		</UserContext.Provider>
	);
}
