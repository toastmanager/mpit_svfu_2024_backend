import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [RoutesController],
  providers: [PrismaService, RoutesService],
})
export class RoutesModule {}
