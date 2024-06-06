export type MediaCollectionFile = {
	name: string;
	content: string; // base64 rapresentation of the file content
	type: string; // mime type
};

export async function fileToMediaCollectionFile(file: File) {
	const base64 = btoa(
		new Uint8Array(await file.arrayBuffer()).reduce(
			(data, byte) => data + String.fromCharCode(byte),
			"",
		),
	);

	return {
		name: file.name,
		content: base64,
		type: file.type,
	};
}

export async function mediaCollectionFileToFile(file: MediaCollectionFile) {
	const fileContent = atob(file.content);
	const array = new Uint8Array(fileContent.length);

	for (let i = 0; i < fileContent.length; i++) {
		array[i] = fileContent.charCodeAt(i);
	}

	return new File([array], file.name, { type: file.type });
}
