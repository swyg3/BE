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
import { FirstAddressInsertCommandHandler } from './commands/handlers/first-address-insert.handler';
import { UserRepository } from 'src/users/repositories/user.repository';
import { EventBusService } from 'src/shared/infrastructure/event-sourcing/event-bus.service';
import { NaverMapsClient } from 'src/shared/infrastructure/database/navermap.config';
import { UsersModule } from 'src/users/users.module';
import { EventSourcingModule } from 'src/shared/infrastructure/event-sourcing/event-sourcing.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LocationResultCache2 } from './caches/location-cache2';
import { SearchLocationSavedHandler } from './events/handlers/search-location-save.handler';
import { LocationSearchCache } from './caches/location-cache.search';

const CommandHandlers = [
  SaveAddressHandler,
  UpdateCurrentLocationHandler,
  SearchLocationSavedHandler,
  FirstAddressInsertCommandHandler,
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
    forwardRef(() => UsersModule),
    EventSourcingModule,
    CqrsModule,
    HttpModule,
    ConfigModule,
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
    LocationResultCache2,
    LocationSearchCache,
    NaverMapsClient,
    ...CommandHandlers,
    ...EventsHandlers,
    ...QuerysHandlers,
  ],
  exports: [
    UserLocationRepository,
    LocationViewRepository,
  ],
})
export class LocationModule { }