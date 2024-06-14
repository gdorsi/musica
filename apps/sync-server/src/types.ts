export type MediaStorageApi = {
	getFile(userId: string, fileId: string): Promise<Buffer>;
	storeFile(userId: string, fileId: string, data: Blob): Promise<void>;
	listUserFiles(userId: string): Promise<string[]>;
};
