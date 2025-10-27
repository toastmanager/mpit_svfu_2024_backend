import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { PrismaService } from 'src/prisma.service';
import { PlaceReviewsService } from './reviews/place-reviews.service';
import { PlacesStorageRepository } from './places.storage';

@Module({
	controllers: [PlacesController],
	providers: [
		PlacesService,
		PrismaService,
		PlaceReviewsService,
		PlacesStorageRepository,
	],
})
export class PlacesModule {}
