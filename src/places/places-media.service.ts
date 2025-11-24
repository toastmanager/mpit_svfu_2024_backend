import { Injectable } from '@nestjs/common';
import { StorageProvider } from 'src/storage/storage.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class PlacesMediaService {
	constructor(private readonly storage: StorageProvider) {}

	FOLDER_NAME = 'places';

	async uploadPlaceImage({
		file,
		filename,
	}: {
		file: Buffer;
		filename: string;
	}): Promise<string> {
		const uniqueKey = `${this.FOLDER_NAME}/${randomUUID()}-${filename}`;

		await this.storage.save({
			file,
			path: uniqueKey,
		});

		return uniqueKey;
	}

	async getImageUrl({ key }: { key: string }) {
		return this.storage.getSignedUrl(key);
	}

	async deleteImage({ key }: { key: string }) {
		return this.storage.delete(key);
	}
}
