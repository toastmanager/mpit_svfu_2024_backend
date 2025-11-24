import { Activity } from './activtiy';
import { PlaceType } from './place-type';

export class PlaceFilters {
	types?: PlaceType[];
	ageRestriction?: number;
	activities?: Activity[];
	minPrice?: number;
	maxPrice?: number;
	start?: Date;
	end?: Date;
	searchQuery?: string;
}
