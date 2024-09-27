import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { GeocodingResponse } from 'src/product/response/geocodingresponse';

@Injectable()
export class NaverMapsClient {
  private readonly apiUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('NAVER_MAPS_API_URL');
    this.clientId = this.configService.get<string>('NAVER_MAPS_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('NAVER_MAPS_CLIENT_SECRET');
  }

  async getGeocode(query: string): Promise<GeocodingResponse> {
    const url = `${this.apiUrl}?query=${encodeURIComponent(query)}`;
    const { data } = await this.httpService.get<GeocodingResponse>(url, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': this.clientId,
        'X-NCP-APIGW-API-KEY': this.clientSecret,
      },
    }).toPromise();
    return data;
  }
}