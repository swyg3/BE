import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  BadRequestException,
  Inject,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { RegisterUserCommand } from "../commands/register-user.command";
import { User } from "../../entities/user.entity";
import { v4 as uuidv4 } from "uuid";
import { UserRegisteredEvent } from "src/users/events/events/user-registered.event";
import { REDIS_CLIENT } from "src/shared/infrastructure/redis/redis.config";
import Redis from "ioredis";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";
import { PasswordService } from "src/shared/services/password.service";
import { UserRepository } from "src/users/repositories/user.repository";

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand>
{
  private readonly logger = new Logger(RegisterUserHandler.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly eventBusService: EventBusService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  async execute(command: RegisterUserCommand): Promise<string> {
    const { email, password, pwConfirm, name, phoneNumber } = command;

    this.logger.log(`사용자 등록 시도: ${email}`);

    // 이메일 인증 상태 확인
    await this.validateVerificationStatus(email);

    // 비밀번호 확인 및 생성
    this.validatePassword(password, pwConfirm);

    // 중복 가입 확인
    await this.checkExistingUser(email);

    // 사용자 생성 또는 업데이트
    const hashedPassword = await this.passwordService.hashPassword(password);
    const userId = uuidv4();
    const user = await this.createUser(
      userId,
      email,
      hashedPassword,
      name,
      phoneNumber,
    );
    await this.publishUserRegisteredEvent(user);
    await this.cleanupRedisData(email);

    this.logger.log(`사용자 등록 완료: ${user.id}`);
    return user.id;
  }

  private async validateVerificationStatus(email: string): Promise<void> {
    const emailVerified = await this.redisClient.get(`email_verified:${email}`);
    if (emailVerified !== "true") {
      throw new UnauthorizedException("이메일 인증이 완료되지 않았습니다.");
    }
  }

  private validatePassword(password: string, pwConfirm: string): void {
    if (password !== pwConfirm) {
      throw new BadRequestException(
        "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
      );
    }
  }

  private async checkExistingUser(email: string): Promise<void> {
    const existingUser = await this.userRepository.findByEmailIncludingDeleted(email);
    if (existingUser) {
      if (existingUser.isDeleted) {
        throw new BadRequestException(
          "이전에 탈퇴한 계정입니다. [마이 페이지]에서 가입한 계정을 재활성화해주세요."
        );
      } else {
        throw new BadRequestException("이미 가입한 이메일입니다.");
      }
    }
  }

  private async createUser(
    userId: string,
    email: string,
    hashedPassword: string,
    name: string,
    phoneNumber: string,
  ): Promise<User> {
    const newUser = this.userRepository.create({
      id: userId,
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      isEmailVerified: true,
      agreeReceiveLocation: false,
    });
    return this.userRepository.save(newUser);
  }

  private async publishUserRegisteredEvent(user: User): Promise<void> {
    const userRegisteredEvent = new UserRegisteredEvent(
      user.id,
      {
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        isEmailVerified: true,
        agreeReceiveLocation: user.agreeReceiveLocation,
      },
      1,
    );
    await this.eventBusService.publishAndSave(userRegisteredEvent);
    this.logger.log(`사용자 등록 이벤트 발행: ${user.id}`);
  }

  private async cleanupRedisData(email: string): Promise<void> {
    await this.redisClient.del(`email_verified:${email}`);
  }
}
