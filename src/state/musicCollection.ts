import { type Doc, useFireproof } from "use-fireproof";

export type MusicCollectionItem = {
	_id: string;
	fileName: string;
	title: string;
};

export function useMusicCollection() {
	const { database, useDocument, useLiveQuery } =
		useFireproof("musicCollection");

	async function addFilesToTheCollection(fileList: FileList) {
		for (const file of fileList) {
			await database.put<MusicCollectionItem>({
				_id: crypto.randomUUID(),
				fileName: file.name,
				// Remove the file extension on the title
				title: file.name.replace(/\..+?$/, ""),
				_files: {
					media: file,
				},
			});
		}
	}

	return { addFilesToTheCollection, useDocument, useLiveQuery };
}

export async function getMediaFile(item: Doc<MusicCollectionItem>) {
	const media = item._files?.media;

	if (!media) return null;
	if ("file" in media && media.file) {
		return media.file();
	}

	return null;
}
