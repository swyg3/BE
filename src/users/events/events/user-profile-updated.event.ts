import { UpdateUserProfileDto } from "src/users/dtos/update-user-profile.dto";

export class UserProfileUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly updateData: UpdateUserProfileDto,
  ) {}
}
