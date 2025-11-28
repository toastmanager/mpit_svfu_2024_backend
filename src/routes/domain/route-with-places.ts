import { Place } from 'src/places/domain/place';
import { Route } from './route';

export class RouteWithPlaces extends Route {
	places: Place[];

	constructor(props: Route & { places: Place[] }) {
		super(props);
		Object.assign(this, props);
	}
}
