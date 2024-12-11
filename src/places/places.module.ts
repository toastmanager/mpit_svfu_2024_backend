import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { PrismaService } from 'src/prisma.service';
import { PlaceReviewsService } from './reviews/place-reviews.service';
import { PlacesStorage } from './places.storage';

@Module({
	controllers: [PlacesController],
	providers: [PlacesService, PrismaService, PlaceReviewsService, PlacesStorage],
})
export class PlacesModule {}
