import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLocationRepository } from './location.repository';
import { SaveUserLocationHandler } from './commands/handlers/location-saver.handler';
import { UserLocation } from './location.entity';
import { DynamooseModule } from 'nestjs-dynamoose';
import { UserLocationSchema } from './location-view.schema';
import { UserLocationSavedHandler } from './events/handlers/location-save-event.handler';
import { GetUserLocationsHandler } from './queries/query/get-userlocation-all.handler';
import { LocationController } from './location.controller';
import { LocationHandler } from './commands/handlers/add-location.handler';
import { LocationViewRepository } from './location-view.repository';
import { ProductModule } from 'src/product/product.module';

const CommandHandlers = [
  SaveUserLocationHandler,
  LocationHandler
];
const EventsHandlers = [
  UserLocationSavedHandler
];
const QuerysHandlers = [
  GetUserLocationsHandler
];

@Module({
  imports: [
    forwardRef(() => ProductModule),
    CqrsModule,
    TypeOrmModule.forFeature([UserLocation]),
    DynamooseModule.forFeature([
      { name: "LocationView", schema: UserLocationSchema },
    ]),

  ],
  controllers: [LocationController],
  providers: [
    UserLocationRepository,
    LocationViewRepository,
    ...CommandHandlers,
    ...EventsHandlers,
    ...QuerysHandlers,
  ],
  exports: [
    UserLocationRepository,
    LocationViewRepository],
})
export class LocationModule { }