import { Injectable } from '@nestjs/common';
import { PlaceReview as PrismaPlaceReview } from '@prisma/client';

@Injectable()
export class PlaceReviewPrismaMapper {
	toDomain(raw: PrismaPlaceReview): PlaceReview {
		return new PlaceReview(raw);
	}

	toDomainList(raw: PrismaPlaceReview[]): PlaceReview[] {
		return raw.map((prismaPlace) => this.toDomain(prismaPlace));
	}
}
