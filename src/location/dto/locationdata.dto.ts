import { IsBoolean, IsNotEmpty, IsNumber } from "class-validator";

export class LocationDataDto {
  @IsNumber()
  @IsNotEmpty()
  longitude: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: string;

  @IsBoolean()
  @IsNotEmpty()
  agree: boolean;
}