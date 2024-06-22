export type MediaStorageApi = {
	getFile(fileId: string): Promise<Buffer>;
	storeFile(fileId: string, data: Blob): Promise<void>;
	fileExist(fileId: string): Promise<boolean>;
};
