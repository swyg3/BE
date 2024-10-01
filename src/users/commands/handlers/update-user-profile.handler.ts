import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { UserProfileUpdatedEvent } from "src/users/events/events/user-profile-updated.event";
import { UpdateUserProfileCommand } from "../commands/update-user-profile.command";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";
import { UserRepository } from "src/users/repositories/user.repository";

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler
  implements ICommandHandler<UpdateUserProfileCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: UpdateUserProfileCommand) {
    const { userId, updateData } = command;

    const user = await this.userRepository.findByUserId(userId);
    if (!user) {
      throw new NotFoundException("존재하지 않는 회원입니다.");
    }

    if (user.isDeleted) {
      throw new BadRequestException("탈퇴한 회원의 프로필은 수정할 수 없습니다.");
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
