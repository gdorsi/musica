import { MediaStorageApi } from "@musica/shared/mediaStorage";

export class MediaStorage implements MediaStorageApi {
	async storeFile(name: string, file: Blob) {
		const root = await navigator.storage.getDirectory();

		const fileHandle = await root.getFileHandle(name, {
			create: true,
		});

		// TODO: Safari doesn't support this, switch to createSyncAccessHandle
		// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createSyncAccessHandle
		const writable = await fileHandle.createWritable();
		await writable.write(await file.arrayBuffer());
		await writable.close();
	}

	async getFile(fileName: string) {
		const root = await navigator.storage.getDirectory();
		const fileHandle = await root.getFileHandle(fileName);

		const file = await fileHandle.getFile();

		return file as Blob;
	}

	async deleteFile(fileName: string) {
		const root = await navigator.storage.getDirectory();

		return root.removeEntry(fileName);
	}

	async fileExist(fileName: string) {
		const root = await navigator.storage.getDirectory();

		try {
			await root.getFileHandle(fileName);

			return true;
		} catch (err) {
			return false;
		}
	}
}

export const mediaStorage = new MediaStorage();
