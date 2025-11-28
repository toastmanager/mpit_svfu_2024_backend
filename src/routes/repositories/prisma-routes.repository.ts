import { PrismaService } from 'src/prisma.service';
import { RoutesRepository } from './routes.repository';
import { CreateRouteParams } from '../domain/params/create-route.params';
import { Route } from '../domain/route';
import { UpdateRouteParams } from '../domain/params/update-route.params';
import { RoutePrismaMapper } from './mappers/route-prisma.mapper';
import { RouteWithPlaces } from '../domain/route-with-places';

export class PrismaRoutesRepository implements RoutesRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly routePrismaMapper: RoutePrismaMapper,
	) {}

	async create({
		authorId,
		data,
	}: {
		authorId: number;
		data: CreateRouteParams;
	}): Promise<number> {
		const prismaRoute = await this.prisma.route.create({
			data: {
				...data,
				author: {
					connect: {
						id: authorId,
					},
				},
			},
			select: {
				id: true,
			},
		});

		return prismaRoute.id;
	}

	async findAll(): Promise<Route[]> {
		const prismaRoutes = await this.prisma.route.findMany();
		return this.routePrismaMapper.toDomainList(prismaRoutes);
	}

	async findAllByUser({ userId }: { userId: number }): Promise<Route[]> {
		const prismaRoutes = await this.prisma.route.findMany({
			where: {
				authorId: userId,
			},
		});
		return this.routePrismaMapper.toDomainList(prismaRoutes);
	}

	async findOneById({ id }: { id: number }): Promise<Route> {
		return this.prisma.route.findUnique({
			where: {
				id,
			},
		});
	}

	async findOneByIdWithPlaces({
		id,
	}: {
		id: number;
	}): Promise<RouteWithPlaces> {
		const prismaRoute = await this.prisma.route.findUnique({
			where: {
				id,
			},
			include: {
				places: true,
			},
		});

		return this.routePrismaMapper.toDomainWithPlaces(prismaRoute);
	}

	async update({
		id,
		data,
	}: {
		id: number;
		data: UpdateRouteParams;
	}): Promise<void> {
		await this.prisma.route.update({
			where: { id },
			data,
		});
	}

	async deleteById({ id }: { id: number }): Promise<void> {
		await this.prisma.route.delete({ where: { id } });
	}

	async addPlace({
		routeId,
		placeId,
	}: {
		routeId: number;
		placeId: number;
	}): Promise<void> {
		await this.prisma.route.update({
			where: {
				id: routeId,
			},
			data: {
				places: {
					connect: {
						id: placeId,
					},
				},
			},
		});
	}

	async removePlace({
		routeId,
		placeId,
	}: {
		routeId: number;
		placeId: number;
	}): Promise<void> {
		await this.prisma.route.update({
			where: {
				id: routeId,
			},
			data: {
				places: {
					disconnect: {
						id: placeId,
					},
				},
			},
		});
	}

	async switchPlace({
		routeId,
		placeId,
	}: {
		routeId: number;
		placeId: number;
	}): Promise<void> {
		const route = await this.prisma.route.findUnique({
			where: {
				id: routeId,
			},
			include: {
				places: true,
			},
		});

		if (route.places.filter((place) => place.id === placeId).length !== 0) {
			await this.removePlace({
				routeId,
				placeId,
			});
		} else {
			await this.addPlace({
				routeId,
				placeId,
			});
		}
	}
}
