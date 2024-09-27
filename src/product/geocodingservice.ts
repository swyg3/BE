\import { Injectable } from '@nestjs/common';
import { NaverMapsClient } from 'src/shared/infrastructure/database/navermap.config';
import { GeocodingResponse } from './response/geocodingresponse';


@Injectable()
export class GeocodingService {
  constructor(private readonly naverMapsClient: NaverMapsClient) {}

  async getGeocode(query: string): Promise<GeocodingResponse> {
    return this.naverMapsClient.getGeocode(query);
  }
}