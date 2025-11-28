import { PlaceDto } from 'src/places/dto/place.dto';

export class RouteWithPlacesDto {
	id: number;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	places: PlaceDto[];
}
