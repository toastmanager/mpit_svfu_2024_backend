import { Injectable, Logger } from '@nestjs/common';
import { PlacesMediaService } from './places-media.service';
import { PlacesRepository } from './repositories/places.repository';
import { CreatePlaceParams } from './domain/params/create-place.params';
import { Place } from './domain/place';
import { PlaceFilters } from './domain/place-filters';
import { UpdatePlaceParams } from './domain/params/update-place.params';

@Injectable()
export class PlacesService {
	private readonly logger: Logger = new Logger(PlacesService.name);

	constructor(
		private readonly placesMediaService: PlacesMediaService,
		private readonly placesRepository: PlacesRepository,
	) {}

	async addImage({
		id,
		buffer,
		filename,
	}: {
		id: number;
		buffer: Buffer;
		filename: string;
	}): Promise<string> {
		const imageKey = await this.placesMediaService.uploadPlaceImage({
			file: buffer,
			filename: filename,
		});

		try {
			await this.placesRepository.addImageKey({
				id: id,
				key: imageKey,
			});
		} catch (error) {
			this.logger.error(
				`DB Update failed for place ${id}. Rolling back media upload: ${imageKey}`,
			);

			try {
				this.placesMediaService.deleteImage({ key: imageKey });
			} catch (cleanupError) {
				this.logger.error(
					`Failed to cleanup orphaned file: ${imageKey}`,
					cleanupError,
				);
			}

			throw error;
		}

		return imageKey;
	}

	async deleteImage({
		id,
		key,
	}: {
		id: number;
		key: string;
	}): Promise<Place> {
		try {
			await this.placesRepository.deleteImageKey({
				id: id,
				key: key,
			});

			const updatedPlace: Place =
				await this.placesRepository.findOneById(id);

			await this.placesMediaService.deleteImage({ key: key });

			return updatedPlace;
		} catch (error) {
			this.logger.error(
				`Failed to delete image key "${key}" from place with id "${id}"`,
				error,
			);
			throw error;
		}
	}

	async findOneImageUrls({ id }: { id: number }): Promise<string[]> {
		const place: Place = await this.placesRepository.findOneById(id);
		const { imageKeys } = place;

		const imageUrls: string[] = [];
		for (const key of imageKeys) {
			imageUrls.push(
				await this.placesMediaService.getImageUrl({
					key: key,
				}),
			);
		}

		return imageUrls;
	}

	async findOneById({ id }: { id: number }): Promise<Place> {
		return this.placesRepository.findOneById(id);
	}

	async create({
		authorId,
		params,
	}: {
		authorId: number;
		params: CreatePlaceParams;
	}): Promise<number> {
		try {
			const id = await this.placesRepository.create({ authorId, params });
			return id;
		} catch (error) {
			this.logger.error(
				`Failed to create place with author id "${authorId}"`,
				error,
			);
			throw error;
		}
	}

	async findAllWithFilters(query: PlaceFilters): Promise<Place[]> {
		return this.placesRepository.findAllWithFilters(query);
	}

	async findUserPublished({ userId }: { userId: number }): Promise<Place[]> {
		return this.placesRepository.findUserPublished({ userId });
	}

	async update({
		id,
		data,
	}: {
		id: number;
		data: UpdatePlaceParams;
	}): Promise<void> {
		await this.placesRepository.update({
			id,
			params: data,
		});
	}

	async delete({ id }: { id: number }): Promise<void> {
		await this.placesRepository.delete({ id });
	}

	async findUserDrafts({ userId }: { userId: number }): Promise<Place[]> {
		return await this.placesRepository.findUserDrafts({ userId });
	}

	async findUserPlacesOnModeration({
		userId,
	}: {
		userId: number;
	}): Promise<Place[]> {
		return await this.placesRepository.findUserPlacesOnModeration({
			userId,
		});
	}

	async findClosest(id: number): Promise<Place[]> {
		return this.placesRepository.findClosest({ id });
	}
}
