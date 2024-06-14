import { useState } from "react";
import { RepoContext } from "@automerge/automerge-repo-react-hooks";

import App from "./ui/pages/Home";
import { Registration } from "./ui/pages/Registration";
import { getAuthData } from "./auth/auth";
import { UserContext } from "./auth/useUser";

export function Router() {
	const [auth, setAuth] = useState(getAuthData);

	if (!auth) {
		return <Registration onSuccess={setAuth} />;
	}

	return (
		<UserContext.Provider value={auth.user}>
			<RepoContext.Provider value={auth.repo}>
				<App />
			</RepoContext.Provider>
		</UserContext.Provider>
	);
}
