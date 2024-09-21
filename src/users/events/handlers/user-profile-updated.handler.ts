import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserProfileUpdatedEvent } from "../events/user-profile-updated.event";
import { DyUserViewRepository, DyUserView } from "src/users/repositories/dy-user-view.repository";
import { Logger } from "@nestjs/common";

@EventsHandler(UserProfileUpdatedEvent)
export class UserProfileUpdatedHandler
  implements IEventHandler<UserProfileUpdatedEvent>
{
  private readonly logger = new Logger(UserProfileUpdatedHandler.name);

  constructor(private readonly dyUserViewRepository: DyUserViewRepository) {}

  async handle(event: UserProfileUpdatedEvent) {
    this.logger.log(`UserProfileUpdatedEvent 처리중: ${event.aggregateId}`);

    const updateData: Partial<DyUserView> = {
      ...event.data,
    };

    const updatedUser = await this.dyUserViewRepository.update(event.aggregateId, updateData);

    this.logger.log(`Users-View 업데이트 성공: ${event.aggregateId} 변경 내용: ${updatedUser}`);
  }
}