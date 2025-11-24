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

@Module({
	controllers: [PlacesController],
	providers: [
		PlacesService,
		PrismaService,
		PlaceReviewsService,
		PlacesMediaService,
		PlacePrismaMapper,
		PlaceMapper,
		{
			provide: PlacesRepository,
			useClass: PrismaPlacesRepository,
		},
	],
})
export class PlacesModule {}
