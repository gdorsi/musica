import { type Repo, isValidAutomergeUrl } from "@automerge/automerge-repo";
import { useDocument, useRepo } from "@automerge/automerge-repo-react-hooks";
import { useState } from "react";

function getOrCreateDocument<V>(
	repo: Repo,
	name: string,
	init: (d: V) => void = () => {},
) {
	const documentURL = localStorage.getItem(name);

	if (isValidAutomergeUrl(documentURL)) {
		return documentURL;
	}

	const handle = repo.create<V>();
	handle.change(init);

	localStorage.setItem(name, handle.url);

	return handle.url;
}

export type MusicCollectionItem = {
	fileName: string;
	title: string;
};

export type MusicCollectionDocument = { collection: MusicCollectionItem[] };

export function getDocumentsURLs(repo: Repo) {
	return {
		musicCollection: getOrCreateDocument<MusicCollectionDocument>(
			repo,
			"musicCollection",
			(d) => {
				d.collection = [];
			},
		),
	};
}

export type Documents = ReturnType<typeof getDocumentsURLs>;

export function useMusicCollection() {
	const repo = useRepo();
	const documentUrl = useState(() => getDocumentsURLs(repo).musicCollection)[0];
	const [doc, change] = useDocument<MusicCollectionDocument>(documentUrl);

	const [activeMedia, setActiveMedia] = useState<MusicCollectionItem | null>(
		null,
	);

	async function addFilesToCollection(files: FileList | null) {
		if (!files) return;

		change(({ collection }) => {
			for (const file of files) {
				if (collection.some((item) => item.fileName === file.name)) {
					continue;
				}

				collection.push({
					fileName: file.name,
					// Remove the file extension on the title
					title: file.name.replace(/\..+?$/, ""),
				});
			}
		});
	}

	return {
		collection: doc?.collection ?? [],
		addFilesToCollection,
		activeMedia,
		setActiveMedia,
	};
}
