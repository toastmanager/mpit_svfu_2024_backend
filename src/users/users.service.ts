import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Role, User } from '@prisma/client';

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: Prisma.UserCreateInput): Promise<User> {
		return this.prisma.user.create({
			data,
		});
	}

	async findAll(params: {
		skip?: number;
		take?: number;
		cursor?: Prisma.UserWhereUniqueInput;
		where?: Prisma.UserWhereInput;
		orderBy?: Prisma.UserOrderByWithRelationInput;
	}): Promise<User[]> {
		const { skip, take, cursor, where, orderBy } = params;
		return this.prisma.user.findMany({
			skip,
			take,
			cursor,
			where,
			orderBy,
		});
	}

	async findOne(params: {
		where: Prisma.UserWhereUniqueInput;
		omit?: Prisma.UserOmit;
		include?: Prisma.UserInclude;
	}) {
		return this.prisma.user.findUnique({
			where: params.where,
			omit: params.omit,
			include: params.include,
		});
	}

	async update(params: {
		where: Prisma.UserWhereUniqueInput;
		data: Prisma.UserUpdateInput;
	}): Promise<User> {
		const { where, data } = params;
		return this.prisma.user.update({
			data,
			where,
		});
	}

	async remove(where: Prisma.UserWhereUniqueInput): Promise<User> {
		return this.prisma.user.delete({
			where: where,
		});
	}

	async giveRole(params: {
		where: Prisma.UserWhereUniqueInput;
		role: Role;
	}): Promise<User> {
		const user = await this.prisma.user.update({
			where: params.where,
			data: {
				roles: {
					push: params.role,
				},
			},
		});
		return user;
	}

	async removeRole(params: {
		where: Prisma.UserWhereUniqueInput;
		role: Role;
	}): Promise<User> {
		const user = await this.findOne({
			where: params.where,
		});

		const roleIndex = user.roles.indexOf(params.role);
		if (roleIndex === -1) {
			throw new ForbiddenException('the user does not have this role');
		}

		const newRoles = user.roles.splice(roleIndex, 1);
		const result = await this.prisma.user.update({
			where: params.where,
			data: {
				roles: {
					set: newRoles,
				},
			},
		});
		return result;
	}
}
