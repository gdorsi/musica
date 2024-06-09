import type { MediaStorageApi } from "./types";

import fs from "node:fs/promises";

export class NodeFSMediaStorageAdapter implements MediaStorageApi {
	dir: string;

	constructor(dir: string) {
		this.dir = dir;
	}

	getFile(userId: string, fileId: string): Promise<Buffer> {
		return fs.readFile(`${this.dir}/${userId}/${fileId}`);
	}

	async listUserFiles(userId: string): Promise<string[]> {
		await fs.mkdir(`${this.dir}/${userId}`, {
			recursive: true,
		});

		return fs.readdir(`${this.dir}/${userId}`);
	}

	async storeFile(userId: string, fileId: string, data: Blob): Promise<void> {
		const content = Buffer.from(await data.arrayBuffer());

		await fs.mkdir(`${this.dir}/${userId}`, {
			recursive: true,
		});

		await fs.writeFile(`${this.dir}/${userId}/${fileId}`, content);

		return;
	}
}
