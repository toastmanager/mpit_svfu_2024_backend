import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	NotFoundException,
	Request,
	UseGuards,
	ForbiddenException,
	BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleDto } from './dto/give-role.dto';
import { Role, User } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@ApiBearerAuth()
	@Roles(Role.MODERATOR)
	@UseGuards(JwtAuthGuard, RolesGuard)
	create(@Body() createUserDto: CreateUserDto): Promise<User> {
		return this.usersService.create(createUserDto);
	}

	@Get()
	@ApiBearerAuth()
	@Roles(Role.MODERATOR)
	@UseGuards(JwtAuthGuard, RolesGuard)
	findAll(): Promise<User[]> {
		return this.usersService.findAll({});
	}

	@Get(':id')
	@ApiBearerAuth()
	// @Roles(Role.MODERATOR)
	// @UseGuards(JwtAuthGuard, RolesGuard)
	findOne(@Param('id') id: string): Promise<User> {
		if (isNaN(parseInt(id))) {
			throw new BadRequestException('Id must be int')
		}
		return this.usersService.findOne({
			where: {
				id: +id,
			},
		});
	}

	@Patch(':id')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	update(
		@Request() req: any,
		@Param('id') id: string,
		@Body() updateUserDto: UpdateUserDto,
	): Promise<User> {
		const { user } = req;

		// TODO: SECURITY | Add additional database check for role
		if (user.id !== id && !user.roles?.includes(Role.MODERATOR)) {
			throw new ForbiddenException(
				'You do not have permissions to update this user',
			);
		}

		return this.usersService.update({
			where: {
				id: +id,
			},
			data: updateUserDto,
		});
	}

	@Delete(':id')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	remove(@Request() req: any, @Param('id') id: string): Promise<User> {
		const { user } = req;

		// TODO: SECURITY | Add additional database check for role
		if (user.id !== +id && !user.roles?.includes(Role.MODERATOR)) {
			throw new ForbiddenException(
				'You do not have permissions to delete this user',
			);
		}

		return this.usersService.remove({
			id: +id,
		});
	}

	@Post(':id/roles')
	@ApiBearerAuth()
	@Roles(Role.MODERATOR)
	@UseGuards(JwtAuthGuard, RolesGuard)
	async giveRole(
		@Param('id') id: string,
		@Body() roleDto: RoleDto,
	): Promise<User> {
		const user = await this.usersService.findOne({
			where: {
				id: +id,
			},
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		const result = await this.usersService.giveRole({
			where: {
				id: +id,
			},
			role: roleDto.role,
		});

		return result;
	}

	@Delete(':id/roles')
	@ApiBearerAuth()
	@Roles(Role.MODERATOR)
	@UseGuards(JwtAuthGuard, RolesGuard)
	async removeRole(
		@Param('id') id: string,
		@Body() roleDto: RoleDto,
	): Promise<User> {
		const user = await this.usersService.findOne({
			where: {
				id: +id,
			},
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		const result = await this.usersService.removeRole({
			where: {
				id: +id,
			},
			role: roleDto.role,
		});

		return result;
	}

	@Get(':id/roles')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	async getRoles(
		@Request() req: any,
		@Param('id') id: string,
	): Promise<Role[]> {
		const { user: currentUser } = req;

		// TODO: SECURITY | Add additional database check for role
		if (
			currentUser.id !== id &&
			!currentUser.roles?.includes(Role.MODERATOR)
		) {
			throw new ForbiddenException(
				'You do not have permissions to get this user roles',
			);
		}

		const user = await this.usersService.findOne({
			where: {
				id: +id,
			},
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		return user.roles;
	}
}
