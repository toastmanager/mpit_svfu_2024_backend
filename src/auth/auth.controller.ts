import {
	Body,
	Controller,
	Post,
	UseGuards,
	Request,
	Response,
	InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthTokenDto } from './dto/auth-token.dto';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiForbiddenResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserDto } from 'src/users/dto/user.dto';

const refreshTokenCookieOptions = {
	expires: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // Change according to refresh token expire time
	httpOnly: true,
	sameSite: 'strict',
};

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly usersService: UsersService,
	) {}

	@Post('me')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiUnauthorizedResponse()
	me(@Request() req: any): Promise<UserDto> {
		const { user } = req;
		return this.usersService.findOne({
			where: {
				id: user.id,
			},
		});
	}

	@Post('login')
	@ApiBadRequestResponse()
	async login(
		@Body() loginDto: LoginDto,
		@Response({ passthrough: true }) response: any,
	): Promise<AuthTokenDto> {
		const token = await this.authService.login(loginDto);

		await this.setRefreshTokenInCookie(response, token.refreshToken);

		return token;
	}

	@Post('logout')
	@ApiUnauthorizedResponse()
	async logout(
		@Response({ passthrough: true }) response: any,
	): Promise<{ message: string }> {
		await response.clearCookie('refresh_token', refreshTokenCookieOptions);
		return { message: 'successfully logged out' };
	}

	@Post('register')
	@ApiForbiddenResponse()
	async register(
		@Body() createUserDto: CreateUserDto,
		@Response({ passthrough: true }) response: any,
	): Promise<AuthTokenDto> {
		const token = await this.authService.register(createUserDto);

		await this.setRefreshTokenInCookie(response, token.refreshToken);

		return token;
	}

	@Post('refresh')
	@ApiUnauthorizedResponse()
	async refresh(
		@Request() request: any,
		@Response({ passthrough: true }) response: any,
	): Promise<AuthTokenDto> {
		const cookieRefreshToken = request.cookies['refresh_token'];

		try {
			const newAuthToken =
				await this.authService.refresh(cookieRefreshToken);

			await this.setRefreshTokenInCookie(
				response,
				newAuthToken.refreshToken,
			);

			return newAuthToken;
		} catch (error) {
			console.error(error);
			throw new InternalServerErrorException('Failed to refresh token');
		}
	}

	async setRefreshTokenInCookie(
		@Response() response: any,
		refreshToken: string,
	) {
		await response.cookie(
			'refresh_token',
			refreshToken,
			refreshTokenCookieOptions,
		);
	}
}
