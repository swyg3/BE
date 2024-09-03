import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterUserCommand } from '../commands/register-user.command';
import { UserAggregate } from '../../aggregates/user.aggregate';
import { User } from '../../entities/user.entity';
import { EventStoreService } from '../../../shared/infrastructure/event-store/event-store.service';
import { v4 as uuidv4 } from 'uuid';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventStoreService: EventStoreService
  ) {}

  async execute(command: RegisterUserCommand) {
    const { email, password, name, phoneNumber } = command;

    // 중복 이메일 검증
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('이미 가입한 이메일입니다.');
    }

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

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

    /**
     TODO: 이벤트 직접 발행으로 비동기 작업 처리 필요
      why? 현재는 명령 핸들러(RegisterUserHandler)가 완료되면,
           NestJS 이벤트 시스템에서 '자동으로' 이벤트 핸들러(RegisteredUserHandler)를
           호출하여 MongoDB의 읽기 모델을 업데이트한다.
      문제: 이벤트 스토어, 데이터베이스, 읽기 모델의 데이터 일관성을 보장하지만,
           '동기적'으로 처리되기 때문에 응답시간이 길어지는 문제가 발생한다. 
      해결: EventBus를 주입 받아 명령 처리 과정과 분리하여 이벤트 발행을 
           비동기적으로 처리하면 응답 시간 개선할 수 있다.
      주의사항: (1) 읽기 모델의 일관성이 즉시 보장되지 않는다. 이벤트 처리에 약간 지연이 발생.
              -> 읽기 모델의 최종 일관성 모델을 고려한 로직 설계 필요
              (2) 이벤트 처리 실패에 대한 대응이 필요하다.
              -> DB 트랜잭션 고려 or 메시지 큐(재시도 큐)로 처리 로직 설계 필요
              -> 비동기 처리에 대한 모니터링 필요
      
     */

    // 컨트롤러에 응답 반환
    return userId;
  }
}