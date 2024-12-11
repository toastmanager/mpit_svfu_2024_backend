import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateUserDto {
	@ApiProperty({
		default: 'Pupkin Vasiliy',
	})
	@IsString()
	fullname: string;

	@ApiProperty({
		default: 'example@example.com',
	})
	@IsEmail()
	email: string;

	@ApiPropertyOptional({
		default: '+12345678900',
		required: false,
	})
	@IsPhoneNumber()
	@IsOptional()
	tel?: string;

	@ApiProperty()
	@IsString()
	password: string;
}
