import { Module, Global } from '@nestjs/common';
import { StorageProvider } from './storage.interface';
import { S3StorageProvider } from './s3-storage.provider';

@Global()
@Module({
	providers: [
		{
			provide: StorageProvider,
			useClass: S3StorageProvider,
		},
	],
	exports: [StorageProvider],
})
export class StorageModule {}
