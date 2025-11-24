import { Injectable } from '@nestjs/common';
import { Place as PrismaPlace } from '@prisma/client';
import { Activity } from 'src/places/domain/activtiy';
import { Place } from 'src/places/domain/place';
import { PlaceType } from 'src/places/domain/place-type';

@Injectable()
export class PlacePrismaMapper {
	toDomain(raw: PrismaPlace): Place {
		return new Place({
			...raw,
			price: raw.price.toNumber(),
			prevPrice: raw.prevPrice.toNumber(),
			type: raw.type as unknown as PlaceType,
			activity: raw.activity as unknown as Activity,
		});
	}

	toDomainList(raw: PrismaPlace[]): Place[] {
		return raw.map((prismaPlace) => this.toDomain(prismaPlace));
	}
}
