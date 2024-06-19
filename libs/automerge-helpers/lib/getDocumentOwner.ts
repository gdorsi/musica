import * as A from "@automerge/automerge/next";
import { DocHandle, Repo } from "@automerge/automerge-repo";
import { isValidDocumentId } from "@automerge/automerge-repo/dist/AutomergeUrl";

const cache: Record<string, string> = {};

function getFirstVersion<T>(handle: DocHandle<T>) {
	const doc = handle.docSync();

	if (!doc) return;

	const changes = A.getAllChanges(doc) ?? [];

	if (changes.length > 1) {
		const firstVersion = A.load(changes[0]);

		return firstVersion as A.Doc<T>;
	}

	return doc;
}

// Extracts the document owner going back to the first commit
export async function getDocumentOwner(repo: Repo, documentId: string) {
	if (!isValidDocumentId(documentId)) return;
	if (cache[documentId]) return cache[documentId];

	const handle = repo.find<{ owner: string }>(documentId);

	await handle.whenReady(["unavailable", "ready"]);

	if (handle.state === "ready") {
		const firstVersion = getFirstVersion(handle);

		// Ownerless document
		if (!firstVersion?.owner) return;

		const owner = firstVersion.owner;

		cache[documentId] = owner;

		return owner;
	}

	// The document is unavailable, so we don't know the owner
	return;
}
