import { Role } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class RoleDto {
	@IsEnum(Role)
	role: Role;
}
