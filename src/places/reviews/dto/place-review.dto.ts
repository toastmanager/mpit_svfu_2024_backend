import { IsInt, Min } from 'class-validator';

export class PlaceReviewDto {
	id: number;
	@Min(0)
	@IsInt()
	//TODO: add max
	score: number;
	text: string;
	createdAt: Date;
	updatedAt: Date;
	@IsInt()
	authorId: number;
	@IsInt()
	placeId: number;
}
