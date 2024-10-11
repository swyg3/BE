import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { UserLocationRepository } from '../../location.repository';
import { SetCurrentLocationCommand } from '../impl/set-current-location.command';
import { CurrentLocationSetEvent } from 'src/location/events/impl/location-set.event';
import { UserLocation2 } from 'src/location/location.entity';

@Injectable()
@CommandHandler(SetCurrentLocationCommand)
export class UpdateCurrentLocationHandler implements ICommandHandler<SetCurrentLocationCommand> {
  private readonly logger = new Logger(UpdateCurrentLocationHandler.name);

  constructor(
    private readonly locationRepository: UserLocationRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SetCurrentLocationCommand): Promise<{ id: string; roadAddress: string }> {
    const { userId, id } = command;
    this.logger.log(`Updating current location for user: ${userId}`);

      try {
        // 현재 위치 업데이트
        const result = await this.locationRepository.updateCurrentLocation(userId, id);

        // 업데이트된 위치 정보 조회
        const updatedLocation = result;

        if (!updatedLocation) {
          throw new Error('Selected location does not exist or update failed');
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

        this.logger.log(`User location updated successfully: ${updatedLocation.id}`);

        // 트랜잭션이 커밋된 후 이벤트 발행
        setImmediate(() => {
          this.eventBus.publish(event);
        });

        return { 
          id: updatedLocation.id, 
          roadAddress: updatedLocation.roadAddress 
        };
      } catch (error) {
        this.logger.error(`Failed to update current location for user: ${userId}`, error.stack);
        throw error;
      }
    }
  }
