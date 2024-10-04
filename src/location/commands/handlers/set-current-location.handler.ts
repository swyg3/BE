import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { UserLocationRepository } from '../../location.repository';
import { SetCurrentLocationCommand } from '../impl/set-current-location.command';
import { CurrentLocationSetEvent } from 'src/location/events/impl/location-set.event';

@Injectable()
@CommandHandler(SetCurrentLocationCommand)
export class UpdateCurrentLocationHandler implements ICommandHandler<SetCurrentLocationCommand> {
  private readonly logger = new Logger(UpdateCurrentLocationHandler.name);

  constructor(
    private readonly locationRepository: UserLocationRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: SetCurrentLocationCommand): Promise<void> {
    const { userId, id } = command;
    this.logger.log(`Updating current location for user: ${userId}`);

    try {
      // 모든 위치의 isCurrent를 false로 설정
        // 모든 위치의 isCurrent를 false로 설정하고 선택된 위치를 true로 설정
        const updatedLocation = await this.locationRepository.updateCurrentLocation(userId, id);

        if (!updatedLocation) {
          throw new Error('Selected location does not exist');
        }
  
        // 이벤트 발행
        const event = new CurrentLocationSetEvent(
          updatedLocation.id,
          {
            id: updatedLocation.id,
            userId: updatedLocation.userId,
            updatedAt: new Date()
          },
          1
        );
        this.eventBus.publish(event);

      this.logger.log(`User location updated successfully: ${updatedLocation.id}`);
    } catch (error) {
      this.logger.error(`Failed to update current location for user: ${error.message}`);
      throw error;
    }
  }
}