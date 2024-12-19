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
import { RoutePlaceDto } from './dto/route-place.dto';

@Controller('routes')
export class RoutesController {
	constructor(private readonly routesService: RoutesService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	create(@Request() req: any, @Body() createRouteDto: CreateRouteDto) {
		const { user } = req;
		return this.routesService.create({
			...createRouteDto,
			author: {
				connect: {
					id: user.id,
				},
			},
		});
	}

	@Get()
	findAll() {
		return this.routesService.findAll({});
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	findUserAll(@Request() req: any) {
		const { user } = req;
		return this.routesService.findAll({
			where: {
				authorId: user.id,
			},
		});
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.routesService.findOne({
			where: {
				id: +id,
			},
			include: {
				places: true
			},
		});
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateRouteDto: UpdateRouteDto) {
		return this.routesService.update({
			where: {
				id: +id,
			},
			data: updateRouteDto,
		});
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.routesService.remove({
			id: +id,
		});
	}

	@Post(':id/places/:place_id')
	addPlace(@Param('id') id: string, @Param('place_id') placeId: String) {
		return this.routesService.addPlace(+id, +placeId);
	}

	@Delete(':id/places/:place_id')
	removePlace(@Param('id') id: string, @Param('place_id') placeId: string) {
		return this.routesService.removePlace(+id, +placeId);
	}

	@Patch(':id/places/:place_id')
	switchPlace(@Param('id') id: string, @Param('place_id') placeId: String) {
		return this.routesService.switchPlace(+id, +placeId);
	}
}
