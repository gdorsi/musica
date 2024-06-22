import type { MediaStorageApi } from "./types";

import fs from "node:fs/promises";

export class NodeFSMediaStorageAdapter implements MediaStorageApi {
	dir: string;

	constructor(dir: string) {
		this.dir = dir;
	}

	getFile(fileId: string): Promise<Buffer> {
		return fs.readFile(`${this.dir}/${fileId}`);
	}

	async fileExist(fileId: string): Promise<boolean> {
		try {
			await this.getFile(fileId);
			return true;
		} catch (err) {
			return false;
		}
	}

	async storeFile(fileId: string, data: Blob): Promise<void> {
		const content = Buffer.from(await data.arrayBuffer());

		await fs.mkdir(`${this.dir}`, {
			recursive: true,
		});

		await fs.writeFile(`${this.dir}/${fileId}`, content);

		return;
	}
}
