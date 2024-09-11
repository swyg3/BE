import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserLoggedInEvent } from "../events/user-logged-in.event";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { UserViewRepository } from "src/users/repositories/user-view.repository";
import { Logger } from "@nestjs/common";

@EventsHandler(UserLoggedInEvent)
export class UserLoggedInEventHandler implements IEventHandler<UserLoggedInEvent> {
  private readonly logger = new Logger(UserLoggedInEventHandler.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userViewRepository: UserViewRepository
  ) {}

  async handle(event: UserLoggedInEvent) {

    this.logger.log(`사용자 로그인 이벤트 처리: userId=${event.aggregateId}`);

    // PostgreSQL에서 최신 사용자 정보 조회
    const user = await this.userRepository.findOne({ where: { id: event.aggregateId } });
    if (!user) {
      throw new Error(`존재하지 않는 사용자입니다. : ${event.aggregateId}`);
    }

    // MongoDB의 user_view 컬렉션 업데이트
    const updateResult = await this.userViewRepository.findOneAndUpdate(
      { userId: event.aggregateId },
      {
        $set: {
          email: user.email,
          name: user.name,
          phoneNumber: user.phoneNumber,
          isEmailVerified: user.isEmailVerified,
          lastLoginAt: new Date(),
          updatedAt: new Date()
        },
        $setOnInsert: {
          userId: event.aggregateId,
          createdAt: user.createdAt
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    this.logger.log(`User_View 업데이트 완료: userId=${event.aggregateId}`);
  } catch (error) {
    this.logger.error(`User_View 업데이트 중 오류 발생: ${error.message}`, error.stack);
  }
}