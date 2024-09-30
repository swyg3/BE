import { Injectable } from '@nestjs/common';
import { NaverMapsClient } from 'src/shared/infrastructure/database/navermap.config';
import { GeocodingResponse } from './response/geocodingresponse';


@Injectable()
export class GeocodingService {
  constructor(private readonly naverMapsClient: NaverMapsClient) {}

  async getGeocode(query: string): Promise<GeocodingResponse> {
    return this.naverMapsClient.getGeocode(query);
    //seller 위도경도 이걸 db 값을 만들어서 저장시켜 놓는게 맞지 않을까?
  }
}