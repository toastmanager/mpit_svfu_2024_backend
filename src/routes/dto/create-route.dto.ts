import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateRouteDto {
    @ApiProperty()
    @IsString()
    title: string
}
