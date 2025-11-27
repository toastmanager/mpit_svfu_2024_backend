import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { PrismaService } from 'src/prisma.service';
import { PlaceReviewsService } from './reviews/place-reviews.service';
import { PlacesMediaService } from './places-media.service';
import { PlacesRepository } from './repositories/places.repository';
import { PrismaPlacesRepository } from './repositories/prisma-places.repository';
import { PlacePrismaMapper } from './repositories/mappers/place-prisma.mapper';
import { PlaceMapper } from './places.mapper';
import { PlaceReviewsRepository } from './reviews/repositories/place-reviews.repository';
import { PrismaPlaceReviewsRepository } from './reviews/repositories/prisma-place-reviews.repository';
import { PlaceReviewPrismaMapper } from './reviews/repositories/mappers/place-review-prisma.mapper';

@Module({
	controllers: [PlacesController],
	providers: [
		PlacesService,
		PrismaService,
		PlaceReviewsService,
		PlacesMediaService,
		PlacePrismaMapper,
		PlaceMapper,
		PlaceReviewPrismaMapper,
		{
			provide: PlacesRepository,
			useClass: PrismaPlacesRepository,
		},
		{
			provide: PlaceReviewsRepository,
			useClass: PrismaPlaceReviewsRepository,
		},
	],
})
export class PlacesModule {}
