import { useEffect, useState } from "react";
import { RepoContext } from "@automerge/automerge-repo-react-hooks";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Home } from "./ui/pages/Home";
import { Registration } from "./ui/pages/Registration";
import { getAuthData } from "./auth/auth";
import { UserContext } from "./auth/useUser";
import { Playlist } from "./ui/pages/Playlist";
import { ActiveTrackProvider } from "./audio/ActiveTrackState";
import { acceptPlaylistInvitation } from "./auth/sharing";
import { toast } from "sonner";

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
				</ActiveTrackProvider>
			</RepoContext.Provider>
		</UserContext.Provider>
	);
}
