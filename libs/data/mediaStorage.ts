export type MediaStorageApi = {
	getFile(fileId: string): Promise<Blob>;
	storeFile(fileId: string, data: Blob): Promise<void>;
	fileExist(fileId: string): Promise<boolean>;
	deleteFile(fileId: string): Promise<void>;
};
