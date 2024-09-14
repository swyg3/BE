import { NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { UserProfileUpdatedEvent } from "src/users/events/events/user-profile-updated.event";
import { Repository } from "typeorm";
import { UpdateUserProfileCommand } from "../commands/update-user-profile.command";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler
  implements ICommandHandler<UpdateUserProfileCommand>
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: UpdateUserProfileCommand) {
    const { userId, updateData } = command;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("존재하지 않는 회원입니다.");
    }

    // 변경 가능한 필드만 업데이트
    if (updateData.name !== undefined) user.name = updateData.name;
    if (updateData.phoneNumber !== undefined)
      user.phoneNumber = updateData.phoneNumber;

    await this.userRepository.save(user);

    // 이벤트 발행 및 저장
    const version = 1;
    const userProfileUpdatedEvent = new UserProfileUpdatedEvent(
      userId,
      updateData,
      version,
    );

    await this.eventBusService.publishAndSave(userProfileUpdatedEvent);

    return user;
  }
}
