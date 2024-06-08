export async function copyToPrivateFileSystem(name: string, file: File) {
	const root = await navigator.storage.getDirectory();

	const fileHandle = await root.getFileHandle(name, {
		create: true,
	});

	const writable = await fileHandle.createWritable();
	await writable.write(await file.arrayBuffer());
	await writable.close();
}

export async function getFile(fileName: string) {
	const root = await navigator.storage.getDirectory();
	const fileHandle = await root.getFileHandle(fileName);

	const file = await fileHandle.getFile();

	return file;
}
