import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigifyModule } from '@itgorillaz/configify';
import { PlacesModule } from './places/places.module';
import { RoutesModule } from './routes/routes.module';

@Module({
	imports: [
		UsersModule,
		AuthModule,
		ConfigifyModule.forRootAsync(),
		PlacesModule,
		RoutesModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
