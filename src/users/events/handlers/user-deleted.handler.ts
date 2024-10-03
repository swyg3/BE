import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserDeletedEvent } from "../events/user-deleted.event";
import { UserViewRepository } from "src/users/repositories/user-view.repository";
import { Logger } from "@nestjs/common";

@EventsHandler(UserDeletedEvent)
export class UserDeletedHandler implements IEventHandler<UserDeletedEvent> {

  private readonly logger = new Logger(UserDeletedHandler.name);
  
  constructor(private readonly userViewRepository: UserViewRepository) {}

  async handle(event: UserDeletedEvent) {

    this.logger.log(`UserDeletedEvent 처리중: ${event.aggregateId}`);
    
    // DynamoDB 읽기 모델 업데이트
    await this.userViewRepository.delete(event.aggregateId);
  }
}
