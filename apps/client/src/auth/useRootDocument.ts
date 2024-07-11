import { useDocument } from "@automerge/automerge-repo-react-hooks";
import { useUser } from "./useUser";
import { RootDocument } from "@musica/shared/models/RootDocument";

export const useRootDocument = () => {
	const user = useUser();

	// TODO: Maybe trigger suspense when the document is undefined?
	return useDocument<RootDocument>(user.rootDocument);
};
