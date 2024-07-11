import {
	Chunk,
	StorageAdapterInterface,
	type StorageKey,
} from "@automerge/automerge-repo";

export class DurableObjectAutomergeStorageAdapter
	implements StorageAdapterInterface
{
	constructor(public storage: DurableObjectStorage) {}

	async load(keyArray: StorageKey): Promise<Uint8Array | undefined> {
		return this.storage.get<Uint8Array>(keyArray.join("/"));
	}

	async save(keyArray: string[], binary: Uint8Array): Promise<void> {
		await this.storage.put(keyArray.join("/"), binary);
	}

	async remove(keyArray: string[]): Promise<void> {
		await this.storage.delete(keyArray.join("/"));
	}

	async loadRange(keyPrefix: string[]): Promise<Chunk[]> {
		const prefix = keyPrefix.join("/");

		const list = await this.storage.list<Uint8Array>({
			prefix,
		});

		const range = Array.from(list).map(([key, data]) => ({
			key: key.split("/"),
			data,
		}));

		return range;
	}

	async removeRange(keyPrefix: string[]): Promise<void> {
		const prefix = keyPrefix.join("/");

		const list = await this.storage.list({
			prefix,
		});

		await this.storage.delete(Array.from(list.keys()));
	}
}
