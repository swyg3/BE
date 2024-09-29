import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserProfileUpdatedEvent } from "../events/user-profile-updated.event";
import { UserViewRepository, UserView } from "src/users/repositories/user-view.repository";
import { Logger } from "@nestjs/common";

@EventsHandler(UserProfileUpdatedEvent)
export class UserProfileUpdatedHandler
  implements IEventHandler<UserProfileUpdatedEvent>
{
  private readonly logger = new Logger(UserProfileUpdatedHandler.name);

  constructor(private readonly userViewRepository: UserViewRepository) {}

  async handle(event: UserProfileUpdatedEvent) {
    this.logger.log(`UserProfileUpdatedEvent 처리중: ${event.aggregateId}`);

    const updateData: Partial<UserView> = {
      ...event.data,
    };

    const updatedUser = await this.userViewRepository.update(event.aggregateId, updateData);

    this.logger.log(`Users-View 업데이트 성공: ${event.aggregateId} 변경 내용: ${updatedUser}`);
  }
}