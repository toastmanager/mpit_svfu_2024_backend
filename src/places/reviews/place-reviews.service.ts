import { Injectable } from '@nestjs/common';
import { UpdatePlaceReviewParams } from './domain/params/update-review.params';
import { PlaceReviewsRepository } from './repositories/place-reviews.repository';

@Injectable()
export class PlaceReviewsService {
	constructor(
		private readonly placeReviewsRepository: PlaceReviewsRepository,
	) {}

	async create({
		data,
		authorId,
		placeId,
	}: {
		data: CreateReviewParams;
		authorId: number;
		placeId: number;
	}) {
		return this.placeReviewsRepository.create({ data, authorId, placeId });
	}

	async findAllByUserId({ userId }: { userId: number }) {
		return this.placeReviewsRepository.findAllByUserId({ userId });
	}

	async findAllByPlaceId({ placeId }: { placeId: number }) {
		return this.placeReviewsRepository.findAllByPlaceId({ placeId });
	}

	async findAll(): Promise<PlaceReview[]> {
		return this.placeReviewsRepository.findAll();
	}

	async update({
		id,
		data,
	}: {
		id: number;
		data: UpdatePlaceReviewParams;
	}): Promise<void> {
		await this.placeReviewsRepository.update({ id, data });
	}

	async delete({ id }: { id: number }): Promise<void> {
		await this.placeReviewsRepository.delete({ id });
	}
}
