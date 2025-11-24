import { Activity } from './activtiy';
import { PlaceType } from './place-type';

export class Place {
	id: number;
	title: string;
	type: PlaceType;
	description: string;
	locationName: string;
	redirectUrl?: string;
	activity: Activity;
	ageRestriction: number = 0;
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
	authorId: number;

	constructor(props: Place) {
		Object.assign(this, props);
	}
}
