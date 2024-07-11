import fs from "node:fs/promises";
import * as buffer from "node:buffer";
import { MediaStorageApi } from "@musica/shared/mediaStorage";

export class NodeFSMediaStorageAdapter implements MediaStorageApi {
	dir: string;

	constructor(dir: string) {
		this.dir = dir;
	}

	async getFile(fileId: string): Promise<Blob> {
		const content = await fs.readFile(`${this.dir}/${fileId}`);

		return new buffer.Blob([content]) as Blob;
	}

	async fileExist(fileId: string): Promise<boolean> {
		try {
			await this.getFile(fileId);
			return true;
		} catch (err) {
			return false;
		}
	}

	async storeFile(fileId: string, data: Blob) {
		const content = Buffer.from(await data.arrayBuffer());

		await fs.mkdir(`${this.dir}`, {
			recursive: true,
		});

		await fs.writeFile(`${this.dir}/${fileId}`, content);
	}

	async deleteFile(fileId: string): Promise<void> {
		await fs.rm(`${this.dir}/${fileId}`);
	}
}
