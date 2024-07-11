import { MediaStorageApi } from "@musica/shared/mediaStorage";

export class R2MediaStorageAdapter implements MediaStorageApi {
	bucket: R2Bucket;

	constructor(bucket: R2Bucket) {
		this.bucket = bucket;
	}

	async getFile(fileId: string): Promise<Blob> {
		const data = await this.bucket.get(fileId);

		if (!data) {
			throw new Error("File not found");
		}

		return data.blob();
	}

	async fileExist(fileId: string): Promise<boolean> {
		const head = await this.bucket.head(fileId);

		return Boolean(head);
	}

	async storeFile(fileId: string, data: Blob) {
		await this.bucket.put(fileId, data);
	}

	async deleteFile(fileId: string): Promise<void> {
		await this.bucket.delete(fileId);
	}
}
