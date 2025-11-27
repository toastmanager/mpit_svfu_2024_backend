import { PrismaService } from 'src/prisma.service';
import { UpdatePlaceReviewParams } from '../domain/params/update-review.params';
import { PlaceReviewsRepository } from './place-reviews.repository';
import { PlaceReviewPrismaMapper } from './mappers/place-review-prisma.mapper';

export class PrismaPlaceReviewsRepository implements PlaceReviewsRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly placeReviewPrismaMapper: PlaceReviewPrismaMapper,
	) {}

	async create({
		data,
		authorId,
		placeId,
	}: {
		data: CreateReviewParams;
		authorId: number;
		placeId: number;
	}): Promise<number> {
		const place = await this.prisma.placeReview.create({
			data: { ...data, authorId, placeId },
		});

		return place.id;
	}

	async findById({ id }: { id: number }): Promise<PlaceReview> {
		const prismaPlace = await this.prisma.placeReview.findUnique({
			where: {
				id,
			},
		});

		return this.placeReviewPrismaMapper.toDomain(prismaPlace);
	}

	async findAllByUserId({
		userId,
	}: {
		userId: number;
	}): Promise<PlaceReview[]> {
		const prismaPlaces = await this.prisma.placeReview.findMany({
			where: {
				authorId: userId,
			},
		});

		return this.placeReviewPrismaMapper.toDomainList(prismaPlaces);
	}

	async findAllByPlaceId({
		placeId,
	}: {
		placeId: number;
	}): Promise<PlaceReview[]> {
		const prismaPlaces = await this.prisma.placeReview.findMany({
			where: {
				placeId: placeId,
			},
		});

		return this.placeReviewPrismaMapper.toDomainList(prismaPlaces);
	}

	async findAll(): Promise<PlaceReview[]> {
		const prismaPlaces = await this.prisma.placeReview.findMany();
		return this.placeReviewPrismaMapper.toDomainList(prismaPlaces);
	}

	async update({
		id,
		data,
	}: {
		id: number;
		data: UpdatePlaceReviewParams;
	}): Promise<void> {
		await this.prisma.placeReview.update({
			where: {
				id,
			},
			data: data,
		});
	}

	async delete({ id }: { id: number }): Promise<void> {
		await this.prisma.placeReview.delete({
			where: { id },
		});
	}
}
