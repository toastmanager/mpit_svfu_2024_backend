import { CreateRouteParams } from '../domain/params/create-route.params';
import { UpdateRouteParams } from '../domain/params/update-route.params';
import { Route } from '../domain/route';
import { RouteWithPlaces } from '../domain/route-with-places';

export abstract class RoutesRepository {
	abstract create({
		authorId,
		data,
	}: {
		authorId: number;
		data: CreateRouteParams;
	}): Promise<number>;

	abstract findAll(): Promise<Route[]>;

	abstract findAllByUser({ userId }: { userId: number }): Promise<Route[]>;

	abstract findOneById({ id }: { id: number }): Promise<Route>;

	abstract findOneByIdWithPlaces({
		id,
	}: {
		id: number;
	}): Promise<RouteWithPlaces>;

	abstract update({
		id,
		data,
	}: {
		id: number;
		data: UpdateRouteParams;
	}): Promise<void>;

	abstract deleteById({ id }: { id: number }): Promise<void>;

	abstract addPlace({
		routeId,
		placeId,
	}: {
		routeId: number;
		placeId: number;
	}): Promise<void>;

	abstract removePlace({
		routeId,
		placeId,
	}: {
		routeId: number;
		placeId: number;
	}): Promise<void>;

	abstract switchPlace({
		routeId,
		placeId,
	}: {
		routeId: number;
		placeId: number;
	}): Promise<void>;
}
