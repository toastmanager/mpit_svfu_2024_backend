import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { PrismaService } from 'src/prisma.service';
import { RoutesRepository } from './repositories/routes.repository';
import { PrismaRoutesRepository } from './repositories/prisma-routes.repository';
import { RoutePrismaMapper } from './repositories/mappers/route-prisma.mapper';
import { PlacesModule } from 'src/places/places.module';

@Module({
	imports: [PlacesModule],
	controllers: [RoutesController],
	providers: [
		PrismaService,
		RoutesService,
		RoutePrismaMapper,
		{ provide: RoutesRepository, useClass: PrismaRoutesRepository },
	],
})
export class RoutesModule {}
