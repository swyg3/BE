import { Injectable, Logger } from "@nestjs/common";
import { InjectModel, Model } from "nestjs-dynamoose";
import { NaverMapsClient } from "src/shared/infrastructure/database/navermap.config";

export interface LocationView2 {
  locationId: string;
  userId: string;
  searchTerm: string;
  roadAddress: string;
  latitude: string;
  longitude: string;
  isCurrent: boolean;
  isAgreed: boolean;
  updatedAt: Date;
}

@Injectable()
export class LocationViewRepository {

  private readonly logger = new Logger(LocationViewRepository.name);

  constructor(
    @InjectModel("LocationView2")
    private readonly locationViewModel: Model<
      LocationView2,
      { locationId: string }
    >,
    private readonly naverMapsClient: NaverMapsClient
  ) { }


  async create(locationView: LocationView2): Promise<LocationView2> {
    try {
      this.logger.log(`LocationView 생성 시도: ${locationView.locationId}`);

      const item = await this.locationViewModel.create({
        ...locationView,
        latitude: locationView.latitude.toString(),
        longitude: locationView.longitude.toString(),
      });

      this.logger.log(`LocationView 생성 성공: ${item.locationId}`);
      return item;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        this.logger.warn(`LocationView 생성 조건 실패: ${locationView.locationId}`);
      } else {
        this.logger.error(`LocationView 생성 실패: ${error.message}`, error.stack);
        throw error;
      }
    }
  }


  //모두 X로 만드는 함수
  private async setAllLocationsToFalse(userId: string): Promise<void> {
    if (!userId) {
      this.logger.warn('유효하지 않은 userId로 setAllLocationsToFalse 호출됨');
      return;
    }

    try {
      const locations = await this.locationViewModel.query("userId").eq(userId).exec();

      if (locations.length === 0) {
        this.logger.log(`${userId}에 대한 위치 정보가 없음`);
        return;
      }

      for (const location of locations) {
        await this.locationViewModel.update({ locationId: location.locationId }, { isCurrent: false });
      }

      this.logger.log(`모든 위치를 false로 설정: ${userId}`);
    } catch (error) {
      this.logger.error(`위치 상태 업데이트 실패: ${error.message}`, error.stack);
      throw error;
    }
  }



  // 판매자ID로 상품 목록 조회
  async findAlllocationbyuserId(userId: string): Promise<LocationView2[]> {
    try {
      this.logger.log(`LocationView 조회: userId=${userId}`);
      const results = await this.locationViewModel
        .query("userId")
        .eq(userId)
        .exec();
      return results;
    } catch (error) {
      this.logger.error(`LocationView 조회 실패: ${error.message}`, error.stack);
      return [];
    }
  }
  // // 위치 정보 삭제
  // async delete(userId: string): Promise<void> {
  //   try {
  //     this.logger.log(`LocationView 삭제: ${userId}`);
  //     await this.locationViewModel.delete({ userId });
  //   } catch (error) {
  //     this.logger.error(`LocationView 삭제 실패: ${error.message}`, error.stack);
  //     throw error;
  //   }
  // }

  async findCurrentLocation(userId: string): Promise<LocationView2 | null> {
    try {
      this.logger.log(`현재 위치 조회: ${userId}`);

      // 사용자 ID로 현재 위치 조회 (GSI 사용)
      const result = await this.locationViewModel
        .query("userId").eq(userId)
        .using("UserIdIndex")
        .filter("isCurrent").eq(true)
        .filter("isAgreed").eq(true)
        .exec();

      if (result.length === 0) {
        this.logger.warn(`사용자 ${userId}의 현재 위치 정보가 없습니다.`);
        return null;
      }

      const currentLocation = result[0];
      return {
        locationId: currentLocation.locationId,
        userId: currentLocation.userId,
        searchTerm: currentLocation.searchTerm,
        roadAddress: currentLocation.roadAddress,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        isCurrent: currentLocation.isCurrent,
        isAgreed: currentLocation.isAgreed,
        updatedAt: currentLocation.updatedAt,
      };
    } catch (error) {
      this.logger.error(`현재 위치 조회 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAllLocations(userId: string): Promise<LocationView2[]> {
    try {
      this.logger.log(`Fetching all locations and reverse geocoding for user: ${userId}`);
      const result = await this.locationViewModel
        .query("userId")
        .eq(userId)
        .using("UserIdIndex")
        .exec();
  
      // isCurrent가 true인 항목을 배열의 맨 앞으로 정렬
      result.sort((a, b) => {
        if (a.isCurrent === b.isCurrent) return 0;
        return a.isCurrent ? -1 : 1;
      });
  
      this.logger.debug(`Found ${result.length} locations for user ${userId}`);
  
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch all locations: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateCurrentLocation(userId: string, newCurrentLocationId: string): Promise<LocationView2[]> {
    this.logger.log(`Updating current location for user: ${userId}`);
  
    try {
        // 1. 사용자의 모든 위치를 조회
        const userLocations = await this.locationViewModel.query('userId').eq(userId).exec();
        this.logger.debug(`Found ${userLocations.length} locations for user ${userId}`);
    
        // 2. 배치 업데이트 항목 준비
        let batchUpdates = userLocations.map(location => ({
            ...location, // 기존 location 객체의 모든 필드를 그대로 복사
            isCurrent: location.locationId === newCurrentLocationId,
            updatedAt: new Date(), // ISO 문자열로 변환
            roadAddress: encodeURIComponent(location.roadAddress), // roadAddress 인코딩
        }));

        // 3. 배치 작업 실행
        const BATCH_SIZE = 25; // DynamoDB의 배치 작업 제한
        for (let i = 0; i < batchUpdates.length; i += BATCH_SIZE) {
            const batch = batchUpdates.slice(i, i + BATCH_SIZE);
            await this.locationViewModel.batchPut(batch);
        }
    
        // 4. 클라이언트 측에서 정렬
        batchUpdates.sort((a, b) => (b.isCurrent === a.isCurrent) ? 0 : b.isCurrent ? 1 : -1);

        this.logger.log(`Successfully updated current location for user: ${userId}`);
        
        return batchUpdates;
    } catch (error) {
        this.logger.error(`Failed to update current location for user: ${userId}`, error.stack);
        throw error;
    }
}
}