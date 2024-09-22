import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserRegisteredEvent } from "../events/user-registered.event";
import { Logger } from "@nestjs/common";
import { UserViewRepository } from "src/users/repositories/user-view.repository";

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler
  implements IEventHandler<UserRegisteredEvent>
{
  private readonly logger = new Logger(UserRegisteredHandler.name);

  constructor(private readonly userViewRepository: UserViewRepository) {}

  async handle(event: UserRegisteredEvent) {
    this.logger.log(`UserRegisteredEvent 처리중: ${event.aggregateId}`);

    try {
      await this.userViewRepository.create({
        userId: event.aggregateId,
        email: event.data.email,
        name: event.data.name,
        phoneNumber: event.data.phoneNumber,
        isEmailVerified: event.data.isEmailVerified,
      });
      this.logger.log(`Users-View 업데이트 성공: ${event.aggregateId}`);
    } catch (error) {
      this.logger.error(
        `Users-View 업데이트 실패: ${event.aggregateId}, ${error.message}`,
        error.stack,
      );
    }
  }
}
