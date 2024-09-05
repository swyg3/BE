import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterUserCommand } from '../commands/register-user.command';
import { UserAggregate } from '../../aggregates/user.aggregate';
import { User } from '../../entities/user.entity';
import { EventStoreService } from '../../../shared/infrastructure/event-store/event-store.service';
import { v4 as uuidv4 } from 'uuid';
import { UserRegisteredEvent } from 'src/users/events/events/user-registered.event';
import { PasswordService } from 'src/users/services/password.service';
import { REDIS_CLIENT } from 'src/shared/infrastructure/redis/redis.config';
import Redis from 'ioredis';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  private readonly logger = new Logger(RegisterUserHandler.name)

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventStoreService: EventStoreService,
    private readonly passwordService: PasswordService,
    @Inject(EventBus) private readonly eventBus: EventBus,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis
  ) {}

  async execute(command: RegisterUserCommand) {
    const { email, password, pwConfirm, name, phoneNumber } = command;

    // Redis에서 이메일 인증 상태 확인
    const isEmailVerified = await this.redisClient.get(`email_verified:${email}`);
    if (isEmailVerified !== 'true') {
      throw new UnauthorizedException('이메일 인증이 완료되지 않았습니다.');
    }

    // 비밀번호 확인 검증
    if (password !== pwConfirm) {
      throw new BadRequestException('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
    }

    // 중복 이메일 검증
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('이미 가입한 이메일입니다.');
    }

    const userId = uuidv4();

    // Argon2를 사용한 비밀번호 해싱
    const hashedPassword = await this.passwordService.hashPassword(password);

    const userAggregate = new UserAggregate(userId);
    const events = userAggregate.register(email, name, phoneNumber);

    // 이벤트 저장소에 저장
    for (const event of events) {
      await this.eventStoreService.saveEvent({
        aggregateId: userId,
        aggregateType: 'User',
        eventType: event.constructor.name,
        eventData: event,
        version: event.version
      });
    }

    // 데이터베이스에 저장
    const user = this.userRepository.create({
      id: userId,
      email,
      password: hashedPassword,
      name,
      phoneNumber
    });
    await this.userRepository.save(user);

    // 이벤트 비동기 발행
    const userRegisteredEvent = new UserRegisteredEvent(userId, email, name, phoneNumber, true, 1);
    this.logger.log(`UserRegisteredEvent 이벤트 발행: ${userId}`);
    this.eventBus.publish(userRegisteredEvent);

    // Redis에서 이메일 인증 상태 삭제
    await this.redisClient.del(`email_verified:${email}`);

    // 컨트롤러에 응답 반환
    return userId;
  }
}