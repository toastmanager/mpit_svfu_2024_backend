import { Coordinates } from '../coordinates';
import { Place } from '../place';

export type CreatePlaceParams = Pick<
	Place,
	| 'title'
	| 'type'
	| 'description'
	| 'locationName'
	| 'redirectUrl'
	| 'activity'
	| 'ageRestriction'
	| 'price'
	| 'prevPrice'
	| 'start'
	| 'end'
	| 'address'
	| 'contacts'
> & {
	coordinates: Coordinates;
};
