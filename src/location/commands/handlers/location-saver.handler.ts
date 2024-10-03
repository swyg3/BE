import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { SaveUserLocationCommand } from '../impl/location-save.command';
import { UserLocationRepository } from 'src/location/location.repository';
import { UserLocation } from 'src/location/location.entity';
import { UserLocationSavedEvent } from 'src/location/events/impl/location-save-event';
import { Logger } from '@nestjs/common';

@CommandHandler(SaveUserLocationCommand)
export class SaveUserLocationHandler implements ICommandHandler<SaveUserLocationCommand> {
  private readonly logger = new Logger(SaveUserLocationHandler.name);

  constructor(
    private readonly userLocationRepository: UserLocationRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SaveUserLocationCommand): Promise<UserLocation> {
    const { userId, latitude, longitude, isCurrent } = command;
    console.log('Received command:', command);

    try {
      // 만약 현재 위치로 설정하려면, 기존의 현재 위치를 해제
      if (isCurrent) {
        await this.userLocationRepository.unsetCurrentLocation(userId);
      }

      // 위치 저장
      const savedLocation: UserLocation = await this.userLocationRepository.saveUserLocation({
        userId,
        latitude,
        longitude,
        isCurrent// isCurrent가 undefined면 true로 설정
      });

      // 이벤트 발행
      const event = new UserLocationSavedEvent(
        savedLocation.id, // aggregateId
        {
          userId: savedLocation.userId,
          latitude: savedLocation.latitude,
          longitude: savedLocation.longitude,
          isCurrent: savedLocation.isCurrent,
          updatedAt: savedLocation.updatedAt,
        },
        1 // version (예시)
      );
      this.eventBus.publish(event);

      this.logger.log(`User location saved successfully: ${savedLocation.id}`);

      // 저장된 위치 반환
      return savedLocation;
    } catch (error) {
      this.logger.error(`Failed to save user location: ${error.message}`, error.stack);
      throw error; // 또는 더 구체적인 에러 처리
    }
  }
}