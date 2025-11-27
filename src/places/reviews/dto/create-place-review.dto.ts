import { IsInt, Min } from 'class-validator';

export class CreatePlaceReviewDto {
	text: string;
	@IsInt()
	@Min(0)
	//TODO: add max
	score: number;
}
