import { Injectable } from '@nestjs/common';
import { PlaceReview, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PlaceReviewsService {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: Prisma.PlaceReviewCreateInput): Promise<PlaceReview> {
		return this.prisma.placeReview.create({
			data,
		});
	}

	async findAll(params: {
		skip?: number;
		take?: number;
		cursor?: Prisma.PlaceReviewWhereUniqueInput;
		where?: Prisma.PlaceReviewWhereInput;
		include?: Prisma.PlaceReviewInclude;
		orderBy?: Prisma.PlaceReviewOrderByWithRelationInput;
	}): Promise<PlaceReview[]> {
		const { skip, take, cursor, where, orderBy, include } = params;
		return this.prisma.placeReview.findMany({
			skip,
			take,
			cursor,
			where,
			orderBy,
			include,
		});
	}

	async findOne(params: {
		where: Prisma.PlaceReviewWhereUniqueInput;
		omit?: Prisma.PlaceReviewOmit;
	}): Promise<PlaceReview | null> {
		return this.prisma.placeReview.findUnique({
			where: params.where,
			omit: params.omit,
		});
	}

	async update(params: {
		where: Prisma.PlaceReviewWhereUniqueInput;
		data: Prisma.PlaceReviewUpdateInput;
	}): Promise<PlaceReview> {
		const { where, data } = params;
		return this.prisma.placeReview.update({
			data,
			where,
		});
	}

	async remove(
		where: Prisma.PlaceReviewWhereUniqueInput,
	): Promise<PlaceReview> {
		return this.prisma.placeReview.delete({
			where: where,
		});
	}
}
