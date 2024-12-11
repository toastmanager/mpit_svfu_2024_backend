import {
	Body,
	Controller,
	Post,
	UseGuards,
	Request,
	Response,
	BadRequestException,
} from '@nestjs/common';
import { AuthService, Token } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { TokenRefreshDto } from './dto/token-refresh.dto';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

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
	me(@Request() req: any) {
		const { user } = req;
		return this.usersService.findOne({
			where: {
				id: user.id,
			},
		});
	}

	@Post('login')
	async login(
		@Body() loginDto: LoginDto,
		@Response({ passthrough: true }) response: any,
	) {
		const token = await this.authService.login(loginDto);

		await this.setRefreshTokenInCookie(response, token.refreshToken);

		return token;
	}

	@Post('logout')
	async logout(
		@Response({ passthrough: true }) response: any,
	): Promise<{ message: string }> {
		await response.clearCookie('refresh_token', refreshTokenCookieOptions);
		return { message: 'successfully logged out' };
	}

	@Post('register')
	async register(
		@Body() createUserDto: CreateUserDto,
		@Response({ passthrough: true }) response: any,
	) {
		const token = await this.authService.register(createUserDto);

		await this.setRefreshTokenInCookie(response, token.refreshToken);

		return token;
	}

	@Post('refresh')
	async refresh(
		@Body() tokenRefreshDto: TokenRefreshDto,
		@Request() request: any,
		@Response({ passthrough: true }) response: any,
	) {
		let newToken: Token | null = null;

		if (request.cookies) {
			const cookieRefreshToken = request.cookies['refresh_token'];
			if (cookieRefreshToken) {
				try {
					newToken =
						await this.authService.refresh(cookieRefreshToken);
				} catch (error) {
					console.log(error);
					throw error;
				}
			}
		} else if (tokenRefreshDto.refreshToken) {
			try {
				newToken = await this.authService.refresh(
					tokenRefreshDto.refreshToken,
				);
			} catch (error) {
				console.log(error);
				throw error;
			}
		}

		if (!newToken) {
			throw new BadRequestException('Refresh token is not provided');
		}

		await this.setRefreshTokenInCookie(response, newToken.refreshToken);

		return newToken;
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
