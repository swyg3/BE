import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LocationViewRepository } from 'src/location/repositories/location-view.repository';
import { GetCurrentLocationQuery } from '../impl/get-userlocation-iscurrent.query';

@QueryHandler(GetCurrentLocationQuery)
export class GetCurrentLocationHandler implements IQueryHandler<GetCurrentLocationQuery> {
  constructor(private readonly locationViewRepository: LocationViewRepository) {}

  async execute(query: GetCurrentLocationQuery) {
    return this.locationViewRepository.findCurrentLocation(query.userId);
  }
}