import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Request,
	UseGuards,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RouteDto } from './dto/route.dto';
import { RouteWithPlacesDto } from './dto/route-with-places.dto';

@Controller('routes')
export class RoutesController {
	constructor(private readonly routesService: RoutesService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	async create(
		@Request() req: any,
		@Body() createRouteDto: CreateRouteDto,
	): Promise<number> {
		const { user } = req;
		return await this.routesService.create({
			authorId: +user.sub,
			data: { ...createRouteDto },
		});
	}

	@Get()
	findAll(): Promise<RouteDto[]> {
		return this.routesService.findAll();
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	findUserAll(@Request() req: any): Promise<RouteDto[]> {
		const { user } = req;
		return this.routesService.findAllByUser({
			userId: +user.sub,
		});
	}

	@Get(':id')
	findOneWithPlaces(@Param('id') id: number): Promise<RouteWithPlacesDto> {
		return this.routesService.findOneByIdWithPlaces({ id });
	}

	@Patch(':id')
	async update(
		@Param('id') id: number,
		@Body() updateRouteDto: UpdateRouteDto,
	): Promise<void> {
		await this.routesService.update({
			id: id,
			data: updateRouteDto,
		});
	}

	@Delete(':id')
	async remove(@Param('id') id: number): Promise<void> {
		await this.routesService.removeById({
			id,
		});
	}

	@Post(':id/places/:place_id')
	async addPlace(
		@Param('id') id: number,
		@Param('place_id') placeId: number,
	): Promise<void> {
		await this.routesService.addPlace({ routeId: id, placeId });
	}

	@Delete(':id/places/:place_id')
	async removePlace(
		@Param('id') id: number,
		@Param('place_id') placeId: number,
	): Promise<void> {
		await this.routesService.removePlace({ routeId: id, placeId });
	}

	@Patch(':id/places/:place_id')
	async switchPlace(
		@Param('id') id: number,
		@Param('place_id') placeId: number,
	): Promise<void> {
		await this.routesService.switchPlace({ routeId: id, placeId });
	}
}
