import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LocationViewRepository } from 'src/location/location-view.repository';
import { GetAllAddressesQuery } from '../impl/get-all-addresses.query';

@QueryHandler(GetAllAddressesQuery)
export class GetUserLocationsHandler implements IQueryHandler<GetAllAddressesQuery> {
  constructor(private readonly locationViewRepository: LocationViewRepository) {}

  async execute(query: GetAllAddressesQuery) {
    return this.locationViewRepository.findAllLocations(query.userId);
  }
}