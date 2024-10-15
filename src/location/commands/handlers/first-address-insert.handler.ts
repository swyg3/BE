import { UserLocationRepository } from "src/location/repositories/location.repository";
import { UserRepository } from "src/users/repositories/user.repository";
import { FirstAddressInsertCommand } from "../impl/first-address-insert-command";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserLocationUpdatedEvent } from "src/users/events/events/user-location-agree-updated.event";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";
import { NaverMapsClient } from "src/shared/infrastructure/database/navermap.config";
import { UserLocation2 } from "src/location/entities/location.entity";
import { UserLocationSavedEvent } from "src/location/events/impl/location-save-event";
import { forwardRef, Inject, Logger } from "@nestjs/common";

@CommandHandler(FirstAddressInsertCommand)
export class FirstAddressInsertCommandHandler implements ICommandHandler<FirstAddressInsertCommand> {
    private readonly logger = new Logger(FirstAddressInsertCommandHandler.name);

    constructor(
        private readonly locationRepository: UserLocationRepository,
        @Inject(forwardRef(() => UserRepository))
        private readonly userRepository: UserRepository,
        private readonly eventBusService: EventBusService,
        private readonly naverMapsClient: NaverMapsClient
    ) { }

    async execute(command: FirstAddressInsertCommand): Promise<any> {
        const { userId, longitude, latitude, agree } = command;

        try {
            
            // 사용자의 agreeReceiveLocation 업데이트
            await this.userRepository.updateUserLocation(userId, agree);

            // user 이벤트 생성
            const userLocationUpdatedEvent = new UserLocationUpdatedEvent(
                userId,
                {
                    agree: agree
                },
                1,
            );
            await this.eventBusService.publishAndSave(userLocationUpdatedEvent);

            // 새로운 현재 위치 생성 (동의한 경우에만)
            let location = null;
            if (agree) {
                // Reverse geocoding 수행
                const reverseGeocodeResult = await this.naverMapsClient.getReverseGeocode(latitude, longitude);

                // reverseGeocodeResult는 이미 도로명 주소 문자열입니다
                const roadAddress = reverseGeocodeResult;

                // searchTerm은 도로명 주소의 일부를 사용할 수 있습니다
                // 예를 들어, 시/군/구까지만 사용
                const searchTerm = roadAddress.split(' ').slice(0, 2).join(' ');

                const newLocation = new UserLocation2();
                newLocation.userId = userId;
                newLocation.searchTerm = searchTerm;
                newLocation.roadAddress = roadAddress;
                newLocation.latitude = latitude;
                newLocation.longitude = longitude;
                newLocation.isCurrent = true;
                newLocation.isAgreed = true;
                newLocation.updatedAt = new Date();

                // 새 위치 정보 저장
                const savedLocation = await this.locationRepository.save(newLocation);

                // location 이벤트 생성
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
                await this.eventBusService.publishAndSave(event);
            }

            this.logger.log(`첫주소가 성공적으로 입력되었습니다 : ${userId}`);
            return location;
        } catch (error) {
            this.logger.error(`첫주소 입력에 실패했습니다 ${userId}: ${error.message}`);
            throw error;
        }
    }

}