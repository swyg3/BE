// import { CommandHandler, ICommandHandler, EventBus } from "@nestjs/cqrs";
// import { Logger } from "@nestjs/common";
// import { AddCurrentLocationCommand } from "../impl/add-current-location.command";
// import { UserLocationRepository } from "src/location/location.repository";
// import { UserLocation } from "src/location/location.entity";
// import { UserLocationSavedEvent } from "src/location/events/impl/location-save-event";

// @CommandHandler(AddCurrentLocationCommand)
// export class LocationHandler implements ICommandHandler<AddCurrentLocationCommand> {
//   private readonly logger = new Logger(LocationHandler.name);

//   constructor(
//     private readonly locationRepository: UserLocationRepository,
//     private readonly eventBus: EventBus
//   ) { }

//   async execute(command: AddCurrentLocationCommand): Promise<UserLocation> {
//     const { userId, latitude, longitude, isCurrent, locationType, isAgreed } = command;

//     // 위치 저장
//     const savedLocation = await this.locationRepository.addLocation(userId, latitude, longitude, isCurrent, locationType, isAgreed);

//     // 이벤트 발행
//     const event = new UserLocationSavedEvent(
//       savedLocation.id, // aggregateId
//       {
//         userId: savedLocation.userId,
//         latitude: savedLocation.latitude,
//         longitude: savedLocation.longitude,
//         isCurrent: savedLocation.isCurrent,
//         locationType: savedLocation.locationType,
//         isAgreed: savedLocation.isAgreed,
//         updatedAt: savedLocation.updatedAt,
//       },
//       1 // version (예시)
//     );
//     this.eventBus.publish(event);

//     this.logger.log(`User location saved successfully: ${savedLocation.id}`);

//     // 저장된 위치 반환
//     return savedLocation;
//   }
// }