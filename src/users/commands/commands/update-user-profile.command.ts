import { UpdateUserProfileDto } from "src/users/dtos/update-user-profile.dto";

export class UpdateUserProfileCommand {
    constructor(
      public readonly userId: string,
      public readonly updateData: UpdateUserProfileDto
    ) {}
  }