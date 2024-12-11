import { Configuration, Value } from '@itgorillaz/configify';

@Configuration()
export class AuthConfig {
	@Value('JWT_SECRET')
	jwtSecret: string;

	@Value('JWT_ACCESS_TOKEN_EXPIRES_IN')
	jwtAccessTokenExpiresIn: string;

	@Value('JWT_REFRESH_TOKEN_EXPIRES_IN')
	jwtRefreshTokenExpiresIn: string;
}
