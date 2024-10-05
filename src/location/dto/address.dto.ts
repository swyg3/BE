import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AddressDto {
    @ApiProperty({ example: '테헤란로 152' })
    @IsString()
    @IsNotEmpty()
    searchTerm: string;

    @ApiProperty({ example: '서울특별시 강남구 테헤란로 152' })
    @IsString()
    @IsNotEmpty()
    roadAddress: string;

}
