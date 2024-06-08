import { useState } from "react";
import { UserContext, getCurrentUser } from "./state/user";
import App from "./ui/pages/Home";
import { Registration } from "./ui/pages/Registration";

export function Router() {
	const [user, setUser] = useState(getCurrentUser);

	if (!user) {
		return <Registration onSuccess={setUser} />;
	}

	return (
		<UserContext.Provider value={user}>
			<App />
		</UserContext.Provider>
	);
}
