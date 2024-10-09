import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

interface GeocodingResult {
  x: string;
  y: string;
}

interface ReverseGeocodingOptions {
  orders?: string;
  sourcecrs?: 'EPSG:4326' | 'EPSG:3857' | 'NHN:2048';
  output?: 'json' | 'xml';
}


@Injectable()
export class NaverMapsClient {
  private readonly logger = new Logger(NaverMapsClient.name);
  private readonly geocodeApiUrl: string;
  private readonly reverseGeocodeApiUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.geocodeApiUrl = this.configService.get<string>('NAVER_MAP_URL');
    this.reverseGeocodeApiUrl = this.configService.get<string>('NAVER_REVERSE_GEOCODE_URL');
    this.clientId = this.configService.get<string>('NAVER_MAPS_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('NAVER_MAPS_CLIENT_SECRET');
    this.logger.log(`NaverMapsClient initialized with URL: ${this.reverseGeocodeApiUrl}`);
  }

  async getGeocode(query: string): Promise<GeocodingResult> {
    try {
      this.logger.log(`Requesting geocode for query: ${query}`);
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.get(this.geocodeApiUrl, {
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

  
  async getReverseGeocode(latitude: string, longitude: string): Promise<string> {
    this.logger.log(`getReverseGeocode called with lat: ${latitude}, lon: ${longitude}`);
    const coords = `${latitude},${longitude}`;
    
    const url = `${this.reverseGeocodeApiUrl}`;
    const params = new URLSearchParams({
      coords: coords,
      output: 'json',
      orders: 'legalcode,admcode,addr,roadaddr'
    });

    const fullUrl = `${url}?${params.toString()}`;
    this.logger.log(`Preparing API request to: ${fullUrl}`);

    try {
      this.logger.log('Sending API request...');
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.get(fullUrl, {
          headers: {
            'X-NCP-APIGW-API-KEY-ID': this.clientId,
            'X-NCP-APIGW-API-KEY': this.clientSecret
          }
        })
      );

      this.logger.log(`API response received: ${JSON.stringify(response.data)}`);

      if (response.data.status.code === 0 && response.data.results && response.data.results.length > 0) {
        const address = this.extractAddress(response.data.results);
        this.logger.log(`Extracted address: ${address}`);
        return address;
      } else {
        this.logger.warn('No results found in the API response');
        throw new Error('No reverse geocoding result found');
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`API request failed: ${error.message}`);
        this.logger.error(`Error response: ${JSON.stringify(error.response?.data)}`);
      } else {
        this.logger.error(`Unexpected error: ${error.message}`);
      }
      throw error;
    }
  }

  private extractAddress(results: any[]): string {
    const roadAddr = results.find(r => r.name === 'roadaddr');
    if (roadAddr) {
      return this.composeRoadAddress(roadAddr);
    }
    const legalCode = results.find(r => r.name === 'legalcode');
    if (legalCode) {
      return this.composeLegalCodeAddress(legalCode);
    }
    throw new Error('Unable to extract address from results');
  }

  private composeRoadAddress(roadaddr: any): string {
    const region = roadaddr.region;
    const land = roadaddr.land;
    return `${region.area1.name} ${region.area2.name} ${land.name} ${land.number1}${land.number2 ? '-' + land.number2 : ''} ${land.addition0.value || ''}`.trim();
  }

  private composeLegalCodeAddress(legalcode: any): string {
    const region = legalcode.region;
    return `${region.area1.name} ${region.area2.name} ${region.area3.name} ${region.area4.name || ''}`.trim();
  }
}
