import { Injectable } from '@nestjs/common';
import { PlacesRepository } from './places.repository';
import { PrismaService } from 'src/prisma.service';
import {
	PlaceType as PrismaPlaceType,
	Place as PrismaPlace,
	Prisma,
} from '@prisma/client';
import { GetPlacesDto } from '../dto/get-places.dto';
import { Place } from '../domain/place';
import { PlacePrismaMapper } from './mappers/place-prisma.mapper';
import { CreatePlaceParams } from '../domain/params/create-place.params';
import { PlaceFilters } from '../domain/place-filters';
import { UpdatePlaceParams } from '../domain/params/update-place.params';
import { calcScore } from '../places.utils';

@Injectable()
export class PrismaPlacesRepository implements PlacesRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly placePrismaMapper: PlacePrismaMapper,
	) {}

	async findClosest({ id }: { id: number }): Promise<Place[]> {
		const { longitude, latitude, type } = (
			await this.prisma.$queryRaw`
				SELECT ST_X(coords) AS longitude, ST_Y(coords) AS latitude, type
				FROM places
				WHERE id=${id}
			`
		)[0];

		const maxDistanceKm = [PrismaPlaceType.NATURE].includes(type) ? 60 : 10;
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

		const res: unknown[] = [];
		for (const placeData of closestPlacesData) {
			if (placeData.id === id) {
				continue;
			}
			const place = await this.prisma.place.findFirst({
				where: {
					id: placeData.id,
					isPublished: true,
					OR: [
						{
							start: {
								equals: null,
							},
						},
					],
				},
				include: {
					author: true,
					reviews: {
						include: {
							author: true,
						},
					},
				},
			});
			if (place) {
				res.push({
					...place,
					distance: placeData.distance,
					score: calcScore(place.reviews),
				});
			}
		}

		return this.placePrismaMapper.toDomainList(res as PrismaPlace[]);
	}

	async findUserPlacesOnModeration({
		userId,
	}: {
		userId: number;
	}): Promise<Place[]> {
		const prismaPlaces = await this.prisma.place.findMany({
			where: {
				authorId: userId,
				onModeration: true,
			},
		});

		return this.placePrismaMapper.toDomainList(prismaPlaces);
	}

	async findUserDrafts({ userId }: { userId: number }): Promise<Place[]> {
		const prismaPlaces = await this.prisma.place.findMany({
			where: {
				authorId: userId,
				isPublished: false,
			},
		});

		return this.placePrismaMapper.toDomainList(prismaPlaces);
	}

	async delete({ id }: { id: number }): Promise<void> {
		this.prisma.place.delete({
			where: {
				id,
			},
		});
	}

	async update({
		id,
		params,
	}: {
		id: number;
		params: UpdatePlaceParams;
	}): Promise<void> {
		const { coordinates, ...data } = params;

		await this.prisma.place.update({
			where: {
				id: id,
			},
			data: data,
		});

		if (coordinates?.latitude && coordinates?.longitude) {
			await this.prisma.$executeRaw`
				UPDATE places
				SET coords=ST_SetSRID(ST_MakePoint(${coordinates.longitude}, ${coordinates.latitude}), 4326)
				WHERE id=${id}
			`;
		}
	}

	async findUserPublished({ userId }: { userId: number }): Promise<Place[]> {
		const prismaPlaces = await this.prisma.place.findMany({
			where: {
				authorId: userId,
				isPublished: true,
			},
		});

		return this.placePrismaMapper.toDomainList(prismaPlaces);
	}

	async findOneById(id: number): Promise<Place> {
		const prismaPlace = await this.prisma.place.findUnique({
			where: {
				id,
			},
		});

		return this.placePrismaMapper.toDomain(prismaPlace);
	}

	async create({
		authorId,
		params,
	}: {
		authorId: number;
		params: CreatePlaceParams;
	}): Promise<number> {
		const { coordinates, ...data } = params;
		const prismaPlace = await this.prisma.place.create({
			data: { ...data, authorId: authorId },
			select: {
				id: true,
			},
		});

		await this.prisma.$executeRaw`
			UPDATE places
			SET coords=ST_SetSRID(ST_MakePoint(${coordinates.longitude}, ${coordinates.latitude}), 4326)
			WHERE id=${prismaPlace.id}
		`;

		return prismaPlace.id;
	}

	async addImageKey({ id, key }: { id: number; key: string }): Promise<void> {
		await this.prisma.place.update({
			where: { id },
			data: {
				imageKeys: {
					push: key,
				},
			},
		});
	}

	async deleteImageKey({
		id,
		key,
	}: {
		id: number;
		key: string;
	}): Promise<void> {
		await this.prisma.$executeRaw`
			UPDATE "Place" 
			SET "imageKeys" = array_remove("imageKeys", ${key}) 
			WHERE "id" = ${id}
		`;
	}

	async findAllWithFilters(query: PlaceFilters): Promise<Place[]> {
		const whereCaluse = this.buildWhereClause(query);
		const prismaPlaces = await this.prisma.place.findMany({
			where: whereCaluse,
			orderBy: {
				start: 'asc',
			},
		});

		return this.placePrismaMapper.toDomainList(prismaPlaces);
	}

	private buildWhereClause(filters: GetPlacesDto): Prisma.PlaceWhereInput {
		const {
			search,
			start,
			end,
			min_price,
			max_price,
			types,
			activities,
			age_restriction,
		} = filters;

		const where: Prisma.PlaceWhereInput = {
			isPublished: true,
		};

		if (search) {
			where.OR = [
				{ title: { contains: search, mode: 'insensitive' } },
				{ description: { contains: search, mode: 'insensitive' } },
				{ locationName: { contains: search, mode: 'insensitive' } },
			];
		}

		const dateConditions: Prisma.PlaceWhereInput[] = [];

		if (start) {
			dateConditions.push({
				OR: [{ start: { equals: null } }, { start: { gte: start } }],
			});
		}
		if (end) {
			dateConditions.push({
				OR: [{ end: { equals: null } }, { end: { lte: end } }],
			});
		}

		if (dateConditions.length > 0) {
			where.AND = dateConditions;
		}

		if (types?.length) {
			where.type = { in: types };
		}

		if (activities?.length) {
			where.activity = { in: activities };
		}

		if (age_restriction !== undefined) {
			where.ageRestriction = { lte: age_restriction };
		}

		if (min_price !== undefined || max_price !== undefined) {
			where.price = {
				gte: min_price,
				lte: max_price,
			};
		}

		return where;
	}
}
