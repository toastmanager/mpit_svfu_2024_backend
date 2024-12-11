import { ApiProperty } from '@nestjs/swagger';

export class UploadPlaceImagesDto {
	@ApiProperty({
		format: 'binary',
		type: 'string',
	})
	image: Express.Multer.File;
}
