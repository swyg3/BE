import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UserLocationRepository } from '../../location.repository';
import { SetCurrentLocationCommand } from '../impl/set-current-location.command';
import { CurrentLocationSetEvent } from 'src/location/events/impl/location-set.event';

@Injectable()
@CommandHandler(SetCurrentLocationCommand)
export class UpdateCurrentLocationHandler implements ICommandHandler<SetCurrentLocationCommand> {
  private readonly logger = new Logger(UpdateCurrentLocationHandler.name);

  constructor(
    private readonly locationRepository: UserLocationRepository,
    private readonly eventBus: EventBus,
    @InjectEntityManager() private entityManager: EntityManager
  ) {}

  async execute(command: SetCurrentLocationCommand): Promise<void> {
    const { userId, id } = command;
    this.logger.log(`Updating current location for user: ${userId}`);

    await this.entityManager.transaction(async transactionalEntityManager => {
      try {
        const updatedLocation = await this.locationRepository.updateCurrentLocation(
          userId,
          id,
          transactionalEntityManager
        );

        if (!updatedLocation) {
          throw new Error('Selected location does not exist');
        }

        const event = new CurrentLocationSetEvent(
          updatedLocation.id,
          {
            id: updatedLocation.id,
            userId: updatedLocation.userId,
            updatedAt: new Date()
          },
          1
        );

        // 이벤트를 데이터베이스에 저장 (필요한 경우)
        // await transactionalEntityManager.getRepository(CurrentLocationSetEvent).save(event);

        this.logger.log(`User location updated successfully: ${updatedLocation.id}`);

        // 트랜잭션이 커밋된 후 이벤트 발행
        setImmediate(() => {
          this.eventBus.publish(event);
        });

      } catch (error) {
        this.logger.error(`Failed to update current location for user: ${userId}`, error.stack);
        throw error;
      }
    });
  }
}