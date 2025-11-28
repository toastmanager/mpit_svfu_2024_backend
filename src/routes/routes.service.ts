import { Injectable } from '@nestjs/common';
import { CreateRouteParams } from './domain/params/create-route.params';
import { Route } from './domain/route';
import { UpdateRouteParams } from './domain/params/update-route.params';
import { RoutesRepository } from './repositories/routes.repository';
import { RouteWithPlaces } from './domain/route-with-places';

@Injectable()
export class RoutesService {
	constructor(private readonly routesRepository: RoutesRepository) {}

	create({
		authorId,
		data,
	}: {
		authorId: number;
		data: CreateRouteParams;
	}): Promise<number> {
		return this.routesRepository.create({
			authorId,
			data,
		});
	}

	findAll(): Promise<Route[]> {
		return this.routesRepository.findAll();
	}

	findAllByUser({ userId }: { userId: number }): Promise<Route[]> {
		return this.routesRepository.findAllByUser({ userId });
	}

	findOneById({ id }: { id: number }): Promise<Route> {
		return this.routesRepository.findOneById({ id });
	}

	findOneByIdWithPlaces({ id }: { id: number }): Promise<RouteWithPlaces> {
		return this.routesRepository.findOneByIdWithPlaces({ id });
	}

	async update({
		id,
		data,
	}: {
		id: number;
		data: UpdateRouteParams;
	}): Promise<void> {
		await this.routesRepository.update({
			id,
			data,
		});
	}

	async removeById({ id }: { id: number }): Promise<void> {
		await this.routesRepository.deleteById({
			id,
		});
	}

	async addPlace({
		routeId,
		placeId,
	}: {
		routeId: number;
		placeId: number;
	}): Promise<void> {
		await this.routesRepository.addPlace({
			placeId,
			routeId,
		});
	}

	async removePlace({
		routeId,
		placeId,
	}: {
		routeId: number;
		placeId: number;
	}): Promise<void> {
		await this.routesRepository.removePlace({
			routeId,
			placeId,
		});
	}

	async switchPlace({
		routeId,
		placeId,
	}: {
		routeId: number;
		placeId: number;
	}): Promise<void> {
		await this.routesRepository.switchPlace({
			routeId,
			placeId,
		});
	}
}
