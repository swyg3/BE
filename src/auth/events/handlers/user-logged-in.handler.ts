import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserLoggedInEvent } from "../events/user-logged-in.event";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { UserViewRepository } from "src/users/repositories/user-view.repository";

@EventsHandler(UserLoggedInEvent)
export class UserLoggedInEventHandler implements IEventHandler<UserLoggedInEvent> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userViewRepository: UserViewRepository
  ) {}

  async handle(event: UserLoggedInEvent) {
    // PostgreSQL에서 최신 사용자 정보 조회
    const user = await this.userRepository.findOne({ where: { id: event.aggregateId } });
    if (!user) {
      throw new Error(`User not found: ${event.aggregateId}`);
    }

    // MongoDB의 user_view 컬렉션 업데이트
    const userView = await this.userViewRepository.findByUserId(event.aggregateId);
    if (userView) {
      await this.userViewRepository.update(event.aggregateId, {
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        isEmailVerified: user.isEmailVerified,
      });
    } else {
      await this.userViewRepository.create({
        userId: event.aggregateId,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: new Date()
      });
    }
  }
}