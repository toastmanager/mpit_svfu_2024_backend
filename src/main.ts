import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

const APP_ROUTE_PREFIX = 'api';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: '1',
	})
		.setGlobalPrefix(APP_ROUTE_PREFIX)
		.useGlobalPipes(new ValidationPipe())
		.use(cookieParser());

	const config = new DocumentBuilder()
		.setTitle('Ya Tvoi Orientir API Docs')
		.addBearerAuth()
		.build();
	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup(
		`${APP_ROUTE_PREFIX}/:version/docs`,
		app,
		documentFactory,
	);

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
