import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Request,
	UseGuards,
	UseInterceptors,
	UploadedFile,
	Query,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { PlaceReviewsService } from './reviews/place-reviews.service';
import { CreatePlaceReviewDto } from './reviews/dto/create-place-review.dto';
import { UpdatePlaceReviewDto } from './reviews/dto/update-place-review.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadPlaceImagesDto } from './dto/upload-place-images.dto';
import { PlaceDto } from './dto/place.dto';
import { GetPlacesDto } from './dto/get-places.dto';
import { PlaceMapper } from './places.mapper';
import { PlaceReviewDto } from './reviews/dto/place-review.dto';

@Controller('places')
export class PlacesController {
	constructor(
		private readonly placesService: PlacesService,
		private readonly reviewsService: PlaceReviewsService,
		private readonly placeMapper: PlaceMapper,
	) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	create(
		@Request() req: any,
		@Body() createPlaceDto: CreatePlaceDto,
	): Promise<number> {
		const { user } = req;
		const { longitude, latitude, ...data } = createPlaceDto;

		return this.placesService.create({
			authorId: +user.sub,
			params: {
				...data,
				coordinates: {
					latitude,
					longitude,
				},
			},
		});
	}

	@Get()
	async findAll(@Query() query: GetPlacesDto): Promise<PlaceDto[]> {
		const places = await this.placesService.findAllWithFilters(query);
		const placeDtos = await this.placeMapper.toResponseList(places);
		return placeDtos;
	}

	@Get('user/:id')
	async findUserPublished(@Param('id') id: number): Promise<PlaceDto[]> {
		const places = await this.placesService.findUserPublished({
			userId: id,
		});
		return places;
	}

	@Get('user/:id/reviews')
	findUserReviews(@Param('id') id: number): Promise<PlaceReviewDto[]> {
		return this.reviewsService.findAllByUserId({ userId: id });
	}

	@Get('user/:id/drafts')
	findUserDrafts(@Param('id') id: number): Promise<PlaceDto[]> {
		return this.placesService.findUserDrafts({ userId: id });
	}

	@Get('user/:id/on_moderation')
	findUserPlacesOnModeration(@Param('id') id: number): Promise<PlaceDto[]> {
		return this.placesService.findUserPlacesOnModeration({ userId: id });
	}

	@Get('reviews')
	findAllReviews(): Promise<PlaceReviewDto[]> {
		return this.reviewsService.findAll();
	}

	@Get(':id/images')
	async findOneImageUrls(@Param('id') id: number): Promise<string[]> {
		return this.placesService.findOneImageUrls({
			id: id,
		});
	}

	@Post(':id/images')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('image'))
	async addImage(
		@Param('id') id: number,
		@Body() _: UploadPlaceImagesDto,
		@UploadedFile() image: Express.Multer.File,
	): Promise<string> {
		return this.placesService.addImage({
			id: id,
			buffer: image.buffer,
			filename: image.originalname,
		});
	}

	@Delete(':id/images/:imageKey')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	async deleteImage(
		@Param('id') id: number,
		@Param('imageKey') imageKey: string,
	): Promise<void> {
		await this.placesService.deleteImage({
			id: id,
			key: imageKey,
		});
	}

	@Get(':id')
	findOne(@Param('id') id: number): Promise<PlaceDto> {
		return this.placesService.findOneById({ id });
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	async update(
		@Param('id') id: number,
		@Body() updatePlaceDto: UpdatePlaceDto,
	): Promise<void> {
		await this.placesService.update({
			id: id,
			data: updatePlaceDto,
		});
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	async remove(@Param('id') id: string): Promise<void> {
		await this.placesService.delete({
			id: +id,
		});
	}

	@Get(':id/closest')
	async findClosest(@Param('id') id: string): Promise<PlaceDto[]> {
		const places = await this.placesService.findClosest(+id);
		return places;
	}

	@Get(':id/reviews')
	findPlaceAllReviews(@Param('id') id: number): Promise<PlaceReviewDto[]> {
		return this.reviewsService.findAllByPlaceId({ placeId: id });
	}

	@Post(':id/reviews')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	createReview(
		@Request() req: any,
		@Param('id') id: number,
		@Body() createPlaceReviewDto: CreatePlaceReviewDto,
	): Promise<number> {
		const { user } = req;
		return this.reviewsService.create({
			authorId: +user.sub,
			placeId: id,
			data: createPlaceReviewDto,
		});
	}

	@Patch('reviews/:id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	async updateReview(
		@Param('id') id: number,
		@Body() updatePlaceReviewDto: UpdatePlaceReviewDto,
	): Promise<void> {
		await this.reviewsService.update({
			id: id,
			data: updatePlaceReviewDto,
		});
	}

	@Delete('reviews/:id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	async deleteReview(@Param('id') id: string) {
		await this.reviewsService.delete({
			id: +id,
		});
	}
}
