import { PartialType } from '@nestjs/swagger';
import { CreatePlaceReviewDto } from './create-place-review.dto';

export class UpdatePlaceReviewDto extends PartialType(CreatePlaceReviewDto) {}
