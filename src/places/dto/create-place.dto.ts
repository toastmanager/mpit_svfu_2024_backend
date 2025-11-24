import { IsDecimal, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import { PlaceType } from '../domain/place-type';
import { Activity } from '../domain/activtiy';

export class CreatePlaceDto {
	title: string;
	type: PlaceType;
	description: string;
	locationName: string;
	@IsString()
	@IsUrl()
	redirectUrl: string;
	activity: Activity;
	@IsInt()
	ageRestriction: number;
	@IsDecimal()
	price: number;
	@IsOptional()
	@IsDecimal()
	prevPrice?: number;
	longitude: number;
	latitude: number;
	start?: Date;
	end?: Date;
	address?: string;
	contacts: string[];
}
