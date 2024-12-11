import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TokenRefreshDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	refreshToken: string;
}
