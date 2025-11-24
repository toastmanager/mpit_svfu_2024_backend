export interface UploadFileParams {
	file: Buffer;
	path: string; // путь/имя файла
	mimeType?: string;
}

export abstract class StorageProvider {
	abstract save(params: UploadFileParams): Promise<string>;
	abstract delete(path: string): Promise<void>;
	abstract getSignedUrl(
		path: string,
		expiresInSeconds?: number,
	): Promise<string | null>;
	abstract exists(path: string): Promise<boolean>;
}
