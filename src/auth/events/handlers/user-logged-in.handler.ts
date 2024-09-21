import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserLoggedInEvent } from "../events/user-logged-in.event";
import { Logger } from "@nestjs/common";
import { DyUserViewRepository } from "src/users/repositories/dy-user-view.repository";

@EventsHandler(UserLoggedInEvent)
export class UserLoggedInEventHandler
  implements IEventHandler<UserLoggedInEvent>
{
  private readonly logger = new Logger(UserLoggedInEventHandler.name);

  constructor(
    private dyUserViewRepository: DyUserViewRepository,
  ) {}

  async handle(event: UserLoggedInEvent) {
    this.logger.log(`사용자 로그인 이벤트 처리: userId=${event.aggregateId}`);

    // DynamoDB에서 로그인 시간 업데이트
      const updatedUser = await this.dyUserViewRepository.update(event.aggregateId, {
        lastLoginAt: new Date()
      });
      
      this.logger.log(`로그인 이벤트 처리 완료: userId=${event.aggregateId}, 마지막 로그인 시간: ${updatedUser.lastLoginAt}`);
    }
}
