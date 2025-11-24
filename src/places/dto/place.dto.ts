import { IsInt, IsOptional, IsUrl, Min } from 'class-validator';
import { PlaceType } from '../domain/place-type';
import { Activity } from '../domain/activtiy';

export class PlaceDto {
	@IsInt()
	id: number;
	title: string;
	type: PlaceType;
	description: string;
	locationName: string;
	@IsUrl()
	@IsOptional()
	redirectUrl?: string;
	activity: Activity;
	@IsInt()
	@Min(0)
	ageRestriction: number = 0;
	@Min(0)
	price: number = 0;
	prevPrice?: number;
	isPublished: boolean;
	onModeration: boolean;
	start?: Date;
	end?: Date;
	imageKeys: string[];
	address?: string;
	contacts: string[];
	createdAt: Date;
	updatedAt: Date;
	@IsInt()
	authorId: number;
}
