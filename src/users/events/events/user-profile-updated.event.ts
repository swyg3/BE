import { BaseEvent } from "src/shared/infrastructure/event-sourcing";
import { UpdateUserProfileDto } from "src/users/dtos/update-user-profile.dto";

export class UserProfileUpdatedEvent implements BaseEvent {
  eventType = "UserProfileUpdated";
  aggregateType = "User";

  constructor(
    public readonly aggregateId: string,
    public readonly data: UpdateUserProfileDto,
    public readonly version: number, 
  ) {}
}
