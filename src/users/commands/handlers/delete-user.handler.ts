import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteUserCommand } from "../commands/delete-user.command";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";
import { UserRepository } from "src/users/repositories/user.repository";
import { UserDeletedEvent } from "src/users/events/events/user-deleted.event";
import { Logger } from "@nestjs/common";



@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {

  private readonly logger = new Logger(DeleteUserHandler.name);


  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: DeleteUserCommand) {
    const { userId } = command;

    this.logger.log(`회원탈퇴 SoftDelete 시도: ${userId}`);

     // PostgreSQL에서 soft delete 수행
     await this.userRepository.softDelete(userId);
     this.logger.log(`회원탈퇴 SoftDelete 처리 완료: ${userId}`);
 
     // 이벤트 생성, 저장 및 발행
     const userDeletedEvent = new UserDeletedEvent(userId, {}, 1)
     await this.eventBusService.publishAndSave(userDeletedEvent);
     this.logger.log(`회원탈퇴 SoftDelete 이벤트 발행: ${userId}`);
   }
}
