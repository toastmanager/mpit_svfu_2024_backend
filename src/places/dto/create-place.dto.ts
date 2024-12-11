import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Activity, PlaceType } from '@prisma/client';
import {
	IsEnum,
	IsInt,
	IsISO8601,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';

export class CreatePlaceDto {
	@ApiProperty()
	@IsString()
	title: string;

	@ApiProperty()
	@IsEnum(PlaceType)
	type: PlaceType;

	@ApiProperty()
	@IsString()
	description: string;

	@ApiProperty()
	@IsString()
	locationName: string;

	@ApiProperty()
	@IsEnum(Activity)
	activity: Activity;

	@ApiProperty()
	@IsInt()
	ageRestrictions: number;

	@ApiProperty()
	@IsNumber()
	price: number;

	@IsOptional()
	@ApiPropertyOptional()
	@IsNumber()
	prevPrice: number;

	@ApiProperty()
	start: Date;

	@ApiProperty()
	@IsISO8601()
	end: Date;
}
