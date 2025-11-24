import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand,
	HeadObjectCommand,
	HeadBucketCommand,
	CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageConfig } from './storage.config';
import { StorageProvider, UploadFileParams } from './storage.interface';

@Injectable()
export class S3StorageProvider implements StorageProvider, OnModuleInit {
	private readonly s3Client: S3Client;
	private readonly bucketName: string;
	private readonly logger = new Logger(S3StorageProvider.name);

	constructor(private readonly config: StorageConfig) {
		this.bucketName = this.config.bucketName;
		this.s3Client = new S3Client({
			region: this.config.region,
			credentials: {
				accessKeyId: this.config.accessKeyId,
				secretAccessKey: this.config.secretAccessKey,
			},
			endpoint: this.config.endpoint,
			forcePathStyle: this.config.isForcePathStyle,
		});
	}

	async onModuleInit() {
		await this.ensureBucketExists();
	}

	async save(args: UploadFileParams): Promise<string> {
		try {
			await this.s3Client.send(
				new PutObjectCommand({
					Bucket: this.bucketName,
					Key: args.path,
					Body: args.file,
					ContentType: args.mimeType,
				}),
			);
			return args.path;
		} catch (error) {
			this.logger.error(`Failed to upload file: ${args.path}`, error);
			throw error;
		}
	}

	async delete(path: string): Promise<void> {
		await this.s3Client.send(
			new DeleteObjectCommand({
				Bucket: this.bucketName,
				Key: path,
			}),
		);
	}

	async getSignedUrl(path: string, expiresIn = 3600): Promise<string | null> {
		try {
			const exists = await this.exists(path);
			if (!exists) return null;

			const command = new GetObjectCommand({
				Bucket: this.bucketName,
				Key: path,
			});
			return await getSignedUrl(this.s3Client, command, { expiresIn });
		} catch (error) {
			this.logger.warn(`Could not generate signed url for ${path}`);
			return null;
		}
	}

	async exists(path: string): Promise<boolean> {
		try {
			await this.s3Client.send(
				new HeadObjectCommand({
					Bucket: this.bucketName,
					Key: path,
				}),
			);
			return true;
		} catch (error) {
			if (error.name === 'NotFound') return false;
			throw error;
		}
	}

	private async ensureBucketExists() {
		try {
			await this.s3Client.send(
				new HeadBucketCommand({ Bucket: this.bucketName }),
			);
		} catch (error) {
			if (
				error.name === 'NotFound' ||
				error.$metadata?.httpStatusCode === 404
			) {
				this.logger.log(
					`Bucket ${this.bucketName} not found. Creating...`,
				);
				await this.s3Client.send(
					new CreateBucketCommand({ Bucket: this.bucketName }),
				);
			} else {
				this.logger.error('Error checking bucket existence', error);
			}
		}
	}
}
