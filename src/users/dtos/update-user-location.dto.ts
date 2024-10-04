import {
  IsBoolean
} from "class-validator";

export class UpdateUserLocationDto {

  @IsBoolean()
  agree: boolean;

}
