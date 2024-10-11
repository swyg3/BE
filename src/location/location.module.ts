import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLocationRepository } from './repositories/location.repository';
import { UserLocation2 } from './entities/location.entity';
import { DynamooseModule } from 'nestjs-dynamoose';
import { UserLocation2Schema } from './schemas/location-view.schema';
import { UserLocationSavedHandler } from './events/handlers/location-save-event.handler';
import { GetUserLocationsHandler } from './queries/query/get-userlocation-all.handler';
import { LocationController } from './location.controller';
import { LocationViewRepository } from './repositories/location-view.repository';
import { ProductModule } from 'src/product/product.module';
import { GetCurrentLocationHandler } from './queries/query/get-userlocation-iscurrent.handler';
import { SaveAddressHandler } from './commands/handlers/save-address.handler';
import { CurrentLocationSetHandler } from './events/handlers/current-location-set.handler';
import { UpdateCurrentLocationHandler } from './commands/handlers/set-current-location.handler';
import { LocationResultCache } from './caches/location-cache';

const CommandHandlers = [
  SaveAddressHandler,
  UpdateCurrentLocationHandler
];
const EventsHandlers = [
  UserLocationSavedHandler,
  CurrentLocationSetHandler
];
const QuerysHandlers = [
  GetUserLocationsHandler,
  GetCurrentLocationHandler
];

@Module({
  imports: [
    forwardRef(() => ProductModule),
    CqrsModule,
    TypeOrmModule.forFeature([UserLocation2]),
    DynamooseModule.forFeature([
      { name: "LocationView2", schema: UserLocation2Schema },
    ]),

  ],
  controllers: [LocationController],
  providers: [
    UserLocationRepository,
    LocationViewRepository,
    LocationResultCache,
    ...CommandHandlers,
    ...EventsHandlers,
    ...QuerysHandlers,
  ],
  exports: [
    UserLocationRepository,
    LocationViewRepository],
})
export class LocationModule { }