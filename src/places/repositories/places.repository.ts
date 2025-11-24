import { Place } from '../domain/place';
import { CreatePlaceParams } from '../domain/params/create-place.params';
import { PlaceFilters } from '../domain/place-filters';
import { UpdatePlaceParams } from '../domain/params/update-place.params';

export abstract class PlacesRepository {
	abstract findOneById(id: number): Promise<Place>;

	abstract update({
		id,
		params,
	}: {
		id: number;
		params: UpdatePlaceParams;
	}): Promise<void>;

	abstract findClosest({ id }: { id: number }): Promise<Place[]>;

	abstract create({
		authorId,
		params,
	}: {
		authorId: number;
		params: CreatePlaceParams;
	}): Promise<number>;

	abstract delete({ id }: { id: number }): Promise<void>;

	abstract addImageKey({
		id,
		key,
	}: {
		id: number;
		key: string;
	}): Promise<void>;

	abstract findAllWithFilters(query: PlaceFilters): Promise<Place[]>;

	abstract findUserPublished({
		userId,
	}: {
		userId: number;
	}): Promise<Place[]>;

	abstract findUserDrafts({ userId }: { userId: number }): Promise<Place[]>;

	abstract findUserPlacesOnModeration({
		userId,
	}: {
		userId: number;
	}): Promise<Place[]>;

	abstract deleteImageKey({
		id,
		key,
	}: {
		id: number;
		key: string;
	}): Promise<void>;
}
