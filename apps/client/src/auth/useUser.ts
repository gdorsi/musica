import { User } from "@musica/shared/models/User";
import { useContext, createContext } from "react";

export const UserContext = createContext<User | null>(null);
export const useUser = () => {
	const user = useContext(UserContext);

	if (user === null) throw new Error("UserContext.Provider is missing");

	return user;
};
