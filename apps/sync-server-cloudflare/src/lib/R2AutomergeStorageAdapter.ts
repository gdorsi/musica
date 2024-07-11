import {
	Chunk,
	StorageAdapterInterface,
	type StorageKey,
} from "@automerge/automerge-repo";

export class R2AutomergeStorageAdapter implements StorageAdapterInterface {
	bucket: R2Bucket;

	constructor(bucket: R2Bucket) {
		this.bucket = bucket;
	}

	async load(keyArray: StorageKey): Promise<Uint8Array | undefined> {
		const data = await this.bucket.get(keyArray.join("/"));

		if (!data) return undefined;

		return new Uint8Array(await data.arrayBuffer());
	}

	async save(keyArray: string[], binary: Uint8Array): Promise<void> {
		await this.bucket.put(keyArray.join("/"), binary);
	}

	async remove(keyArray: string[]): Promise<void> {
		await this.bucket.delete(keyArray.join("/"));
	}

	async loadRange(keyPrefix: string[]): Promise<Chunk[]> {
		const prefix = keyPrefix.join("/");

		const list = await this.bucket.list({
			prefix,
		});

		return Promise.all(
			list.objects.map(async (object) => ({
				key: object.key.split("/"),
				data: await this.load([object.key]),
			})),
		);
	}

	async removeRange(keyPrefix: string[]): Promise<void> {
		const prefix = keyPrefix.join("/");

		const list = await this.bucket.list({
			prefix,
		});

		await this.bucket.delete(list.objects.map((o) => o.key));
	}
}
