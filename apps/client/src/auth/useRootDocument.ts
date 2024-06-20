import { useDocument } from "@automerge/automerge-repo-react-hooks";
import { type RootDocument } from "../data/schema";
import { useUser } from "./useUser";

export const useRootDocument = () => {
	const user = useUser();

	// TODO: Maybe trigger suspense when the document is undefined?
	return useDocument<RootDocument>(user.rootDocument);
};
