import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { AuthConfig } from './auth.config';
import * as authUtils from './auth.utils';

export type Token = {
	accessToken: string;
	refreshToken: string;
	tokenType: string;
};

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly authConfig: AuthConfig,
	) {}

	async login(loginDto: LoginDto): Promise<Token> {
		const user = await this.usersService.findOne({
			where: { email: loginDto.email },
			omit: {
				password: false,
			},
		});

		const isDataMatch =
			user &&
			(await authUtils.comparePasswords(
				loginDto.password,
				user.password,
			));

		if (!isDataMatch) {
			throw new ForbiddenException('Invalid email or password');
		}

		return await this.createToken(user);
	}

	async register(createUserDto: CreateUserDto): Promise<Token> {
		const userWithThatEmail = await this.usersService.findOne({
			where: { email: createUserDto.email },
		});

		if (userWithThatEmail) {
			throw new ForbiddenException('User with that email already exists');
		}

		if (createUserDto.tel) {
			const userWithThatTel = await this.usersService.findOne({
				where: { tel: createUserDto.tel },
			});

			if (userWithThatTel) {
				throw new ForbiddenException(
					'User with that tel already exists',
				);
			}
		}

		const hashedPassword = await authUtils.encodePassword(
			createUserDto.password,
		);

		const newUser = await this.usersService.create({
			...createUserDto,
			password: hashedPassword,
		});

		return await this.createToken(newUser);
	}

	async refresh(refreshToken: string): Promise<Token> {
		try {
			const payload = await this.jwtService.verifyAsync(refreshToken);

			const tokenInIssuedTable =
				await this.prisma.blockedRefreshToken.findFirst({
					where: {
						tokenId: payload.jti,
					},
				});
			if (tokenInIssuedTable != undefined) {
				throw new ForbiddenException('invalid token');
			}
			await this.prisma.blockedRefreshToken.create({
				data: {
					tokenId: payload.jti,
				},
			});

			return this.createToken(payload);
		} catch (error) {
			throw error;
		}
	}

	async createToken(user: User): Promise<Token> {
		return authUtils.createTokenObject(
			await this.createAccessToken(user),
			await this.createRefreshToken(user),
		);
	}

	async createAccessToken(user: User): Promise<string> {
		const payload = {
			id: user.id,
			email: user.email,
			fullname: user.fullname,
			roles: user.roles,
		};
		return await this.jwtService.signAsync(payload, {
			subject: user.id.toString(),
		});
	}

	async createRefreshToken(user: User): Promise<string> {
		const payload = {
			fullname: user.fullname,
			email: user.email,
			id: user.id,
		};

		let newUUUID = crypto.randomUUID();
		while (
			(await this.prisma.blockedRefreshToken.findFirst({
				where: { tokenId: newUUUID },
			})) != undefined
		) {
			newUUUID = crypto.randomUUID();
		}

		return await this.jwtService.signAsync(payload, {
			expiresIn: this.authConfig.jwtRefreshTokenExpiresIn,
			jwtid: newUUUID,
			subject: user.id.toString(),
		});
	}

	getPayload(payload: string): any {
		return this.jwtService.decode(payload);
	}

	async validateUser(email: string, pass: string): Promise<any> {
		const user = await this.usersService.findOne({
			where: { email: email },
			omit: {
				password: false,
			},
		});
		if (user && (await authUtils.comparePasswords(pass, user.password))) {
			const { password, ...result } = user;
			return result;
		}
		return null;
	}
}
