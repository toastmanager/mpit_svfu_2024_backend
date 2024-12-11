import { Inject, Injectable } from '@nestjs/common';
import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { StorageConfig } from './storage.config';

@Injectable()
export class StorageService {
	constructor(private readonly storageConfig: StorageConfig) {}

	bucketName: string;

	private readonly s3Client = new S3Client({
		credentials: {
			accessKeyId: this.storageConfig.accessKeyId,
			secretAccessKey: this.storageConfig.secretAccessKey,
		},
		endpoint: this.storageConfig.endpoint,
		forcePathStyle: this.storageConfig.isForcePathStyle,
		region: this.storageConfig.region,
	});

	async put(
		filename: string,
		file: Buffer,
		generateFilename: boolean = true,
	): Promise<string> {
		if (generateFilename === true) {
			filename = filename.replace(/[^a-zA-Z0-9]/g, '');
			filename = `${randomUUID()}-${filename}`;
		}
		try {
			await this.s3Client.send(
				new PutObjectCommand({
					Bucket: this.bucketName,
					Key: filename,
					Body: file,
				}),
			);
			return filename;
		} catch (error) {
			throw error;
		}
	}

	async get(objectKey: string, expiresIn?: number): Promise<string> {
		try {
			const command = new GetObjectCommand({
				Bucket: this.bucketName,
				Key: objectKey,
			});
			const url = await getSignedUrl(this.s3Client, command, {
				expiresIn: expiresIn || 3600,
			});
			return url;
		} catch (error) {
			throw error;
		}
	}

	async update(objectKey: string, file: Buffer): Promise<string> {
		try {
			return await this.put(objectKey, file, false);
		} catch (error) {
			throw error;
		}
	}

	async delete(objectKey: string): Promise<void> {
		try {
			const command = new DeleteObjectCommand({
				Bucket: this.bucketName,
				Key: objectKey,
			});
			await this.s3Client.send(command);
			return;
		} catch (error) {
			throw error;
		}
	}
}
