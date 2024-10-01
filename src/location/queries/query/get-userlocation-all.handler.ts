import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserLocationsQuery } from '../impl/get-userlocation-all.query';
import { LocationViewRepository } from 'src/location/location-view.repository';

@QueryHandler(GetUserLocationsQuery)
export class GetUserLocationsHandler implements IQueryHandler<GetUserLocationsQuery> {
  constructor(private readonly locationViewRepository: LocationViewRepository) {}

  async execute(query: GetUserLocationsQuery) {
    return this.locationViewRepository.getAllUserLocations(query.userId);
  }
}