import { UpdatePlaceReviewParams } from '../domain/params/update-review.params';

export abstract class PlaceReviewsRepository {
	abstract create({
		data,
		authorId,
		placeId,
	}: {
		data: CreateReviewParams;
		authorId: number;
		placeId: number;
	}): Promise<number>;

	abstract findById({ id }: { id: number }): Promise<PlaceReview>;

	abstract findAllByUserId({
		userId,
	}: {
		userId: number;
	}): Promise<PlaceReview[]>;

	abstract findAllByPlaceId({
		placeId,
	}: {
		placeId: number;
	}): Promise<PlaceReview[]>;

	abstract findAll(): Promise<PlaceReview[]>;

	abstract update({
		id,
		data,
	}: {
		id: number;
		data: UpdatePlaceReviewParams;
	}): Promise<void>;

	abstract delete({ id }: { id: number }): Promise<void>;
}
