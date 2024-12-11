import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PrismaService } from 'src/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthConfig } from './auth.config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
	imports: [
		UsersModule,
		JwtModule.registerAsync({
			inject: [AuthConfig],
			useFactory: async (authConfig: AuthConfig) => {
				return {
					secret: authConfig.jwtSecret,
					signOptions: {
						expiresIn: authConfig.jwtAccessTokenExpiresIn,
					},
				};
			},
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, PrismaService, JwtStrategy],
})
export class AuthModule {}
