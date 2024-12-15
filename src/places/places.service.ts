import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Place, Prisma } from '@prisma/client';
import { calcScore } from './places.utils';

@Injectable()
export class PlacesService {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: Prisma.PlaceCreateInput): Promise<Place> {
		return this.prisma.place.create({
			data,
		});
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
				reviews: true,
			},
		});
		return { ...entity, score: calcScore(entity.reviews) };
	}

	async update(params: {
		where: Prisma.PlaceWhereUniqueInput;
		data: Prisma.PlaceUpdateInput;
	}): Promise<Place> {
		const { where, data } = params;
		return this.prisma.place.update({
			data,
			where,
		});
	}

	async remove(where: Prisma.PlaceWhereUniqueInput): Promise<Place> {
		return this.prisma.place.delete({
			where: where,
		});
	}
}
