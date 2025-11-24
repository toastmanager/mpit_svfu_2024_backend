import {
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	IsDate,
	Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PlaceType } from '../domain/place-type';
import { Activity } from '../domain/activtiy';

export class GetPlacesDto {
	@ApiPropertyOptional({ enum: PlaceType, isArray: true })
	@IsOptional()
	@IsEnum(PlaceType, { each: true })
	@Transform(({ value }) => {
		return typeof value === 'string' ? value.split(',') : value;
	})
	types?: PlaceType[];

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	age_restriction?: number; // Nest сам смапит snake_case из URL, если имена совпадают

	@ApiPropertyOptional({ enum: Activity, isArray: true })
	@IsOptional()
	@IsEnum(Activity, { each: true })
	@Transform(({ value }) =>
		typeof value === 'string' ? value.split(',') : value,
	)
	activities?: Activity[];

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@Min(0)
	min_price?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	max_price?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	start?: Date;

	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	end?: Date;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	search?: string;
}
