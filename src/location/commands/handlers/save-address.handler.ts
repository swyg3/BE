import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { SaveAddressCommand } from '../impl/save-address.command';
import { UserLocationRepository } from 'src/location/location.repository';
import { UserLocation } from 'src/location/location.entity';
import { NaverMapsClient } from 'src/shared/infrastructure/database/navermap.config';
import { UserLocationSavedEvent } from 'src/location/events/impl/location-save-event';
import { Logger } from '@nestjs/common';

@CommandHandler(SaveAddressCommand)
export class SaveAddressHandler implements ICommandHandler<SaveAddressCommand> {
    private readonly logger = new Logger(SaveAddressHandler.name);

    constructor(private readonly locationRepository: UserLocationRepository,
        private readonly naverMapsClient: NaverMapsClient,
        private readonly eventBus: EventBus
    ) { }

    async execute(command: SaveAddressCommand): Promise<UserLocation> {

        const { userId, addressDto } = command;
        const { roadAddress, searchTerm } = addressDto;       
         const geocodeResult = await this.naverMapsClient.getGeocode(roadAddress);

        const newLocation = new UserLocation();
        newLocation.userId = userId;
        newLocation.searchTerm = searchTerm;
        newLocation.roadAddress = roadAddress;
        newLocation.latitude = geocodeResult.y;
        newLocation.longitude = geocodeResult.x;
        newLocation.isCurrent = false; 
        newLocation.isAgreed = true; 
        newLocation.updatedAt = new Date();

        // 새 위치 정보 저장
        const savedLocation = await this.locationRepository.save(newLocation);

        // 이벤트 발행
        const event = new UserLocationSavedEvent(
            savedLocation.id,
            {
              userId: savedLocation.userId,
              searchTerm: savedLocation.searchTerm,
              roadAddress: savedLocation.roadAddress,
              latitude: savedLocation.latitude,
              longitude: savedLocation.longitude,
              isCurrent: savedLocation.isCurrent,
              isAgreed: savedLocation.isAgreed,
              updatedAt: savedLocation.updatedAt,
            },
            1
          );
          this.eventBus.publish(event);
    

        this.logger.log(`User location saved successfully: ${savedLocation.id}`);

        // 저장된 위치 반환
        return savedLocation;
    } catch(error) {
        this.logger.error(`Failed to save address for user : ${error.message}`);
        throw error; // 또는 적절한 에러 처리
    }
}
