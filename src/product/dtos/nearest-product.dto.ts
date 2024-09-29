import { IsNumber } from "class-validator";

export class NearestDto {
  @IsNumber()
  readonly latitude: number;

  @IsNumber()
  readonly longitude: number;
}
