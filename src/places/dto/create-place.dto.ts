import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Activity, PlaceType } from '@prisma/client';
import {
	IsArray,
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
	ageRestriction: number;

	@ApiProperty()
	@IsNumber()
	price: number;

	@IsOptional()
	@ApiPropertyOptional()
	@IsNumber()
	prevPrice: number;

	@ApiProperty()
	@IsNumber()
	longitude: number;

	@ApiProperty()
	@IsNumber()
	latitude: number;

	@IsOptional()
	@ApiPropertyOptional()
	@IsISO8601()
	start: Date;

	@IsOptional()
	@ApiPropertyOptional()
	@IsISO8601()
	end: Date;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	address: string;

	@ApiPropertyOptional({
		type: String,
		isArray: true,
	})
	@IsOptional()
	@IsArray()
	@IsString()
	contacts: string[];
}
