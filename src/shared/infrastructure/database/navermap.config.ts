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

      if (response.data.addresses && response.data.addresses.length > 0) {
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

  calculateApproximateWalkingDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // 지구의 반경 (km)
    
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    const directDistance = R * c;
    
    // Manhattan distance approximation
    const latDistance = Math.abs(lat2 - lat1) * 111.32; // 1도의 위도 거리는 약 111.32km
    const lonDistance = Math.abs(lon2 - lon1) * 111.32 * Math.cos(this.toRadians((lat1 + lat2) / 2));
    
    const manhattanDistance = latDistance + lonDistance;
    
    // 직선거리와 Manhattan distance의 평균을 사용
    const approximateWalkingDistance = (directDistance + manhattanDistance) / 2;
    
    return approximateWalkingDistance * 1000; // 미터 단위로 변환
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}