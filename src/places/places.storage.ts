import { StorageRepository } from 'src/storage/storage';

export class PlacesStorageRepository extends StorageRepository {
	protected getBucketName(): string {
		return 'places';
	}
}
