export async function copyToPrivateFileSystem(name: string, file: Blob) {
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

export async function exist(fileName: string) {
	const root = await navigator.storage.getDirectory();

	try {
		await root.getFileHandle(fileName);

		return true;
	} catch (err) {
		return false;
	}
}
