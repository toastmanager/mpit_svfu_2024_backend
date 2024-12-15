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
import { Activity, Place, PlaceType, Prisma } from '@prisma/client';
import { ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { PlaceReviewsService } from './reviews/place-reviews.service';
import { CreatePlaceReviewDto } from './reviews/dto/create-place-review.dto';
import { UpdatePlaceReviewDto } from './reviews/dto/update-place-review.dto';
import { PlacesStorage } from './places.storage';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadPlaceImagesDto } from './dto/upload-place-images.dto';

@Controller('places')
export class PlacesController {
	constructor(
		private readonly placesService: PlacesService,
		private readonly reviewsService: PlaceReviewsService,
		private readonly placesStorage: PlacesStorage,
	) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	create(@Request() req: any, @Body() createPlaceDto: CreatePlaceDto) {
		const { user } = req;
		return this.placesService.create({
			...createPlaceDto,
			author: {
				connect: {
					id: user.id,
				},
			},
		});
	}

	@Get()
	@ApiQuery({ name: 'types', required: false, type: String })
	@ApiQuery({ name: 'age_restriction', required: false, type: String })
	@ApiQuery({ name: 'activities', required: false, type: String })
	@ApiQuery({ name: 'min_price', required: false, type: Number })
	@ApiQuery({ name: 'max_price', required: false, type: Number })
	@ApiQuery({ name: 'start', required: false, type: Date })
	@ApiQuery({ name: 'end', required: false, type: Date })
	@ApiQuery({ name: 'search', required: false, type: String })
	findAll(
		@Query('types') typesQuery?: string,
		@Query('age_restriction') ageRestrictionsQuery?: string,
		@Query('activities') activitiesQuery?: string,
		@Query('min_price') minPriceQuery?: string,
		@Query('max_price') maxPriceQuery?: string,
		@Query('start') startQuery?: string,
		@Query('end') endQuery?: string,
		@Query('search') searchQuery?: string,
	) {
		const types = typesQuery
			? typesQuery.split(',').reduce((result, element) => {
					const type = PlaceType[element];
					if (type) {
						result.push(type);
					}
					return result;
				}, [])
			: undefined;
		const ageRestriction = isNaN(Number(ageRestrictionsQuery))
			? undefined
			: Number(ageRestrictionsQuery);
		const activities: Activity[] = activitiesQuery
			? activitiesQuery.split(',').reduce((result, element) => {
					const activity = Activity[element];
					if (activity) {
						result.push(activity);
					}
					return result;
				}, [])
			: undefined;
		const minPrice = isNaN(Number(minPriceQuery))
			? undefined
			: Number(minPriceQuery);
		const maxPrice = isNaN(Number(maxPriceQuery))
			? undefined
			: Number(maxPriceQuery);
		const start =
			startQuery == undefined || startQuery == ''
				? new Date()
				: new Date(startQuery);
		const end =
			endQuery == undefined || endQuery == ''
				? undefined
				: new Date(endQuery);
		const search =
			searchQuery == undefined || searchQuery == ''
				? undefined
				: searchQuery;

		return this.placesService.findAll({
			orderBy: {
				start: 'asc',
			},
			where: {
				isPublished: true,
				OR: search
					? [
							{
								title: {
									contains: search,
									mode: 'insensitive',
								},
							},
							{
								description: {
									contains: search,
									mode: 'insensitive',
								},
							},
							{
								locationName: {
									contains: search,
									mode: 'insensitive',
								},
							},
						]
					: undefined,
				AND: [
					end != undefined
						? {
								OR: [
									{
										start: {
											equals: null,
										},
									},
									{
										start: {
											lte: end,
										},
									},
								],
							}
						: {},
					{
						OR: [
							{
								end: {
									equals: null,
								},
							},
							{
								end: {
									gte: start,
								},
							},
						],
					},
				],
				type: {
					in: types,
				},
				ageRestrictions: {
					lte: ageRestriction,
				},
				activity: {
					in: activities,
				},
				price: {
					gte: minPrice,
					lte: maxPrice,
				},
			},
		});
	}

	@Get('user/:id')
	async findUserPublished(@Param('id') id: string) {
		const places = await this.placesService.findAll({
			where: {
				authorId: +id,
				isPublished: true,
			},
		});
		return places;
	}

	@Get('user/:id/reviews')
	findUserReviews(@Param('id') id: string) {
		return this.reviewsService.findAll({
			where: {
				place: {
					authorId: +id,
				},
			},
			include: {
				author: true,
			},
		});
	}

	@Get('user/:id/drafts')
	findUserDrafts(@Param('id') id: string) {
		return this.placesService.findAll({
			where: {
				id: +id,
				isPublished: false,
				onModeration: false,
			},
		});
	}

	@Get('user/:id/on_moderation')
	findUserPlacesOnModeration(@Param('id') id: string) {
		return this.placesService.findAll({
			where: {
				id: +id,
				isPublished: false,
				onModeration: true,
			},
		});
	}

	@Get('reviews')
	findAllReviews() {
		return this.reviewsService.findAll({});
	}

	@Get(':id/images')
	async findOneImages(@Param('id') id: string) {
		const place: Place = await this.placesService.findOne({
			where: {
				id: +id,
			},
		});
		const { imageKeys } = place;

		const imageUrls: string[] = [];
		for (const key of imageKeys) {
			imageUrls.push(await this.placesStorage.get(key));
		}

		return imageUrls;
	}

	@Post(':id/images')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('image'))
	async addImage(
		@Param('id') id: string,
		@Body() _: UploadPlaceImagesDto,
		@UploadedFile() image: Express.Multer.File,
	) {
		const imageKey = await this.placesStorage.put(
			image.originalname,
			image.buffer,
		);

		await this.placesService.update({
			where: {
				id: +id,
			},
			data: {
				imageKeys: {
					push: imageKey,
				},
			},
		});

		return imageKey;
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.placesService.findOne({
			where: {
				id: +id,
			},
		});
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	update(@Param('id') id: string, @Body() updatePlaceDto: UpdatePlaceDto) {
		return this.placesService.update({
			where: {
				id: +id,
			},
			data: updatePlaceDto,
		});
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	remove(@Param('id') id: string) {
		return this.placesService.remove({
			id: +id,
		});
	}

	@Get(':id/reviews')
	findPlaceAllReviews(@Param('id') id: string) {
		console.log('YA3');
		return this.reviewsService.findAll({
			where: {
				placeId: +id,
			},
		});
	}

	@Post(':id/reviews')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	createReview(
		@Request() req: any,
		@Param('id') id: string,
		@Body() createPlaceReviewDto: CreatePlaceReviewDto,
	) {
		const { user } = req;
		return this.reviewsService.create({
			...createPlaceReviewDto,
			place: {
				connect: {
					id: +id,
				},
			},
			author: {
				connect: {
					id: user.id,
				},
			},
		});
	}

	@Patch('reviews/:id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	updateReview(
		@Param('id') id: string,
		@Body() updatePlaceReviewDto: UpdatePlaceReviewDto,
	) {
		return this.reviewsService.update({
			where: {
				id: +id,
			},
			data: updatePlaceReviewDto,
		});
	}

	@Delete('reviews/:id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	removeReview(@Param('id') id: string) {
		return this.reviewsService.remove({
			id: +id,
		});
	}
}
