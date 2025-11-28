import { Injectable } from '@nestjs/common';
import { Place as PrismaPlace, Route as PrismaRoute } from '@prisma/client';
import { PlacePrismaMapper } from 'src/places/repositories/mappers/place-prisma.mapper';
import { Route } from 'src/routes/domain/route';
import { RouteWithPlaces } from 'src/routes/domain/route-with-places';

@Injectable()
export class RoutePrismaMapper {
	constructor(private readonly placePrismaMapper: PlacePrismaMapper) {}

	toDomain(raw: PrismaRoute): Route {
		return new Route(raw);
	}

	toDomainWithPlaces(
		raw: PrismaRoute & { places: PrismaPlace[] },
	): RouteWithPlaces {
		return new RouteWithPlaces({
			...raw,
			places: this.placePrismaMapper.toDomainList(raw.places),
		});
	}

	toDomainList(raw: PrismaRoute[]): Route[] {
		return raw.map((prismaPlace) => this.toDomain(prismaPlace));
	}
}
