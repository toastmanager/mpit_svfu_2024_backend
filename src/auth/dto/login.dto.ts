import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
	@ApiProperty({
		default: 'example@example.com',
	})
	@IsEmail()
	email: string;

	@ApiProperty()
	@IsString()
	password: string;
}
