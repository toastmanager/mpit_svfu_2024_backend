import { Injectable } from '@nestjs/common';
import { PlaceDto } from './dto/place.dto';
import { Place } from './domain/place';

@Injectable()
export class PlaceMapper {
	async toResponseDto(entity: Place): Promise<PlaceDto> {
		return entity;
	}

	async toResponseList(entities: Place[]): Promise<PlaceDto[]> {
		return Promise.all(
			entities.map((entity) => this.toResponseDto(entity)),
		);
	}
}
