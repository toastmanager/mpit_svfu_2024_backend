import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Place, Prisma } from '@prisma/client';
import { calcScore } from './places.utils';

@Injectable()
export class PlacesService {
	constructor(private readonly prisma: PrismaService) {}

	async create(
		data: Prisma.PlaceCreateInput,
		coords: {
			longitude: number;
			latitude: number;
		},
	): Promise<Place> {
		const place = await this.prisma.place.create({
			data,
		});
		await this.prisma.$executeRaw`
			UPDATE places
			SET coords=ST_SetSRID(ST_MakePoint(${coords.latitude}, ${coords.longitude}), 4326)
			WHERE id=${place.id}
		`;
		const updatedPlace = await this.prisma.place.findUnique({
			where: {
				id: place.id,
			},
		});
		return updatedPlace;
	}

	async findAll(params: {
		skip?: number;
		take?: number;
		cursor?: Prisma.PlaceWhereUniqueInput;
		where?: Prisma.PlaceWhereInput;
		orderBy?: Prisma.PlaceOrderByWithRelationInput;
		include?: Prisma.PlaceInclude;
	}): Promise<Place[]> {
		const { skip, take, cursor, where, orderBy, include } = params;
		const entities = await this.prisma.place.findMany({
			skip,
			take,
			cursor,
			where,
			orderBy,
			include: { ...include, reviews: true },
		});
		return entities.map((entity, _) => ({
			...entity,
			score: calcScore(entity.reviews),
		}));
	}

	async findOne(params: {
		where: Prisma.PlaceWhereUniqueInput;
		select?: Prisma.PlaceSelect;
		omit?: Prisma.PlaceOmit;
	}): Promise<any | null> {
		let entity = await this.prisma.place.findUnique({
			where: params.where,
			omit: params.omit,
			include: {
				author: true,
				reviews: {
					include: {
						author: true
					}
				},
			},
		});
		return { ...entity, score: calcScore(entity.reviews) };
	}

	async update(params: {
		where: Prisma.PlaceWhereUniqueInput;
		data: Prisma.PlaceUpdateInput;
		coords?: {
			longitude?: number;
			latitude?: number;
		};
	}): Promise<Place> {
		const { where, data } = params;
		const place = await this.prisma.place.update({
			data,
			where,
		});
		if (params.coords?.latitude && params.coords?.longitude) {
			await this.prisma.$executeRaw`
				UPDATE places
				SET coords=ST_SetSRID(ST_MakePoint(${params.coords.longitude}, ${params.coords.latitude}), 4326)
				WHERE id=${place.id}
			`;
		}
		return place;
	}

	async remove(where: Prisma.PlaceWhereUniqueInput): Promise<Place> {
		return this.prisma.place.delete({
			where: where,
		});
	}

	async findClosest(id: number): Promise<any> {
		const { longitude, latitude } = (
			await this.prisma.$queryRaw`
				SELECT ST_X(coords) AS longitude, ST_Y(coords) AS latitude
				FROM places
				WHERE id=${id}
			`
		)[0];

		const maxDistanceKm = 200;
		const closestPlacesData: {
			id: number;
			distance: number;
		}[] = await this.prisma.$queryRaw`
			SELECT
				id,
				ST_Distance(coords::geography, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography)/1000.0 AS distance
			FROM places
			WHERE ST_Distance(coords::geography, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography)/1000.0 <= ${maxDistanceKm}
			ORDER BY distance
			LIMIT 10
		`;

		const res = [];
		for (const placeData of closestPlacesData) {
			if (placeData.distance == 0) {
				continue;
			}
			const place = await this.findOne({
				where: {
					id: placeData.id,
				},
			});
			res.push({ ...place, distance: placeData.distance });
		}

		return res;
	}
}
