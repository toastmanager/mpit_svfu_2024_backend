import { Role } from '@prisma/client';
import { IsArray, IsEnum, IsInt, IsOptional } from 'class-validator';

export class UserDto {
	@IsInt()
	id: number;
	@IsOptional()
	avatarKey?: string;
	@IsOptional()
	bannerKey?: string;
	createdAt: Date;
	updatedAt: Date;
	description: string;
	fullname: string;
	isActive: boolean;
	isVerified: boolean;
	@IsArray()
	@IsEnum(Role, {})
	roles: Role[];
}
