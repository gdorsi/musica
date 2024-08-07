import { useEffect, useState } from "react";
import { RepoContext } from "@automerge/automerge-repo-react-hooks";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Home } from "./pages/Home";
import { Registration } from "./pages/Registration";
import { getAuthData } from "./auth/auth";
import { UserContext } from "./auth/useUser";
import { Playlist } from "./pages/Playlist";
import { ActiveTrackProvider } from "./audio/ActiveTrackState";
import { acceptPlaylistInvitation } from "./auth/sharing";
import { toast } from "sonner";
import { PlayerControls } from "./components/recipes/player-controls";

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

	useEffect(() => {
		if (!auth) {
			return;
		}

		if (location.hash && location.search === "?share") {
			acceptPlaylistInvitation(
				auth.repo,
				auth.user,
				location.hash.slice(1),
			).then(() => {
				toast("Sharing sucessful!");

				const url = new URL(location.href);
				url.searchParams.delete("share");
				url.hash = "";

				history.replaceState({}, "", url);
			});
		}
	}, [auth]);

	if (!auth) {
		return <Registration onSuccess={setAuth} />;
	}

	return (
		<UserContext.Provider value={auth.user}>
			<RepoContext.Provider value={auth.repo}>
				<ActiveTrackProvider>
					<RouterProvider router={router} />
					<PlayerControls />
				</ActiveTrackProvider>
			</RepoContext.Provider>
		</UserContext.Provider>
	);
}
