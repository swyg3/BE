import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserProfileUpdatedEvent } from "../events/user-profile-updated.event";
import { UserViewRepository } from "src/users/repositories/user-view.repository";
import { Logger } from "@nestjs/common";

@EventsHandler(UserProfileUpdatedEvent)
export class UserProfileUpdatedHandler implements IEventHandler<UserProfileUpdatedEvent> {
  private readonly logger = new Logger(UserProfileUpdatedHandler.name);
  
  constructor(
    private readonly userViewRepository: UserViewRepository
  ) {}

  async handle(event: UserProfileUpdatedEvent) {
    const { userId, updateData } = event;
    await this.userViewRepository.update(userId, updateData);
  }
}