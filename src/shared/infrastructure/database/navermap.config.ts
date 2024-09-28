import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

interface GeocodingResult {
  x: string;
  y: string;
}

@Injectable()
export class NaverMapsClient {
  private readonly logger = new Logger(NaverMapsClient.name);
  private readonly apiUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.apiUrl = this.configService.get<string>('NAVER_MAP_URL');
    this.clientId = this.configService.get<string>('NAVER_MAPS_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('NAVER_MAPS_CLIENT_SECRET');
  }

  async getGeocode(query: string): Promise<GeocodingResult> {
    try {
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.get(this.apiUrl, {
          params: { query },
          headers: {
            'X-NCP-APIGW-API-KEY-ID': this.clientId,
            'X-NCP-APIGW-API-KEY': this.clientSecret,
            'Accept': 'application/json'
          }
        })
      );

      if (response.data.status === 'OK' && response.data.addresses && response.data.addresses.length > 0) {
        const { x, y } = response.data.addresses[0];
        return { x, y };
      } else {
        throw new Error('No geocoding result found');
      }
    } catch (error) {
      this.logger.error(`Failed to get geocode: ${error.message}`);
      throw error;
    }
  }

}