import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreatePlaceReviewDto {
	@ApiProperty()
	@IsString()
	text: string;

	@ApiProperty()
	@IsNumber()
	score: number;
}
