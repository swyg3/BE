import { NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler, EventBus } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { UserProfileUpdatedEvent } from "src/users/events/events/user-profile-updated.event";
import { Repository } from "typeorm";
import { UpdateUserProfileCommand } from "../commands/update-user-profile.command";

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler
  implements ICommandHandler<UpdateUserProfileCommand>
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventBus: EventBus,
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

    // 이벤트 발행
    this.eventBus.publish(new UserProfileUpdatedEvent(userId, updateData));

    return user;
  }
}
