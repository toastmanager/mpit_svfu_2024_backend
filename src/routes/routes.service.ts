import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Route, Prisma } from '@prisma/client';

@Injectable()
export class RoutesService {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: Prisma.RouteCreateInput): Promise<Route> {
		return this.prisma.route.create({
			data,
		});
	}

	async findAll(params: {
		skip?: number;
		take?: number;
		cursor?: Prisma.RouteWhereUniqueInput;
		where?: Prisma.RouteWhereInput;
		orderBy?: Prisma.RouteOrderByWithRelationInput;
	}): Promise<Route[]> {
		const { skip, take, cursor, where, orderBy } = params;
		return this.prisma.route.findMany({
			skip,
			take,
			cursor,
			where,
			orderBy,
			include: {
				places: true,
			},
		});
	}

	async findOne(params: {
		where: Prisma.RouteWhereUniqueInput;
		omit?: Prisma.RouteOmit;
		include?: Prisma.RouteInclude;
	}) {
		return this.prisma.route.findUnique({
			where: params.where,
			omit: params.omit,
			include: params.include,
		});
	}

	async update(params: {
		where: Prisma.RouteWhereUniqueInput;
		data: Prisma.RouteUpdateInput;
	}): Promise<Route> {
		const { where, data } = params;
		return this.prisma.route.update({
			data,
			where,
		});
	}

	async remove(where: Prisma.RouteWhereUniqueInput): Promise<Route> {
		return this.prisma.route.delete({
			where: where,
		});
	}

	async addPlace(routeId: number, placeId: number) {
		return await this.prisma.route.update({
			where: {
				id: routeId,
			},
			include: {
				places: true
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

	async removePlace(routeId: number, placeId: number) {
		return await this.prisma.route.update({
			where: {
				id: routeId,
			},
			include: {
				places: true
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

	async switchPlace(routeId: number, placeId: number) {
		const route = await this.prisma.route.findFirst({
			where: {
				id: routeId,
			},
			include: {
				places: true,
			},
		});

		if (route.places.find((place) => place.id === placeId)) {
			return this.removePlace(routeId, placeId);
		} else {
			return this.addPlace(routeId, placeId);
		}
	}
}
