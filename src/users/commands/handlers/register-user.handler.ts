import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterUserCommand } from '../commands/register-user.command';
import { UserAggregate } from '../../aggregates/user.aggregate';
import { User } from '../../entities/user.entity';
import { EventStoreService } from '../../../shared/infrastructure/event-store/event-store.service';
import { v4 as uuidv4 } from 'uuid';
import { UserRegisteredEvent } from 'src/users/events/events/user-registered.event';
import { PasswordService } from 'src/users/services/password.service';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  private readonly logger = new Logger(RegisterUserHandler.name)

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventStoreService: EventStoreService,
    private readonly passwordService: PasswordService,
    @Inject(EventBus) private readonly eventBus: EventBus
  ) {}

  async execute(command: RegisterUserCommand) {
    const { email, password, pwConfirm, name, phoneNumber } = command;

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
    const userRegisteredEvent = new UserRegisteredEvent(userId, email, name, phoneNumber, false, 1);
    this.logger.log(`Publishing UserRegisteredEvent for user: ${userId}`);
    this.eventBus.publish(userRegisteredEvent);

    // 컨트롤러에 응답 반환
    return userId;
  }
}