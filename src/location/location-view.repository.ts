import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UserLocation } from "./location-view.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "nestjs-dynamoose";

export interface LocationView {
  locationId: string;
  userId: string;
  latitude: string;
  longitude: string;
  isCurrent: boolean;
  updatedAt: Date;
}

@Injectable()
export class LocationViewRepository {

  private readonly logger = new Logger(LocationViewRepository.name);

  constructor(
    @InjectModel("LocationView")
    private readonly locationViewModel: Model<
      LocationView,
      { locationId: string }
    >,
    private readonly configService: ConfigService
  ) { }

 
  async create(locationView: LocationView): Promise<LocationView> {
    try {
      this.logger.log(`LocationView 생성 시도: ${locationView.locationId}`);

      await this.setAllLocationsToFalse(locationView.userId);
      const item = await this.locationViewModel.create({
        ...locationView,
        latitude: locationView.latitude.toString(),
        longitude: locationView.longitude.toString()
      });
      this.logger.log(`LocationView 생성 성공: ${item.locationId}`);
      return item;
    } catch (error) {
      this.logger.error(`LocationView 생성 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  //모두 X로 만드는 함수
  private async setAllLocationsToFalse(userId: string): Promise<void> {
    if (!userId) {
      this.logger.warn('유효하지 않은 userId로 setAllLocationsToFalse 호출됨');
      return;
    }
  
    try {
      const locations = await UserLocation.query("userId").eq(userId).exec();
      
      if (locations.length === 0) {
        this.logger.log(`${userId}에 대한 위치 정보가 없음`);
        return;
      }
  
      for (const location of locations) {
        await UserLocation.update({ id: location.id }, { isCurrent: false });
      }
      
      this.logger.log(`모든 위치를 false로 설정: ${userId}`);
    } catch (error) {
      this.logger.error(`위치 상태 업데이트 실패: ${error.message}`, error.stack);
      throw error;
    }
  }



  // 판매자ID로 상품 목록 조회
  async findAlllocationbyuserId(userId: string): Promise<LocationView[]> {
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
  // 위치 정보 삭제
  async delete(userId: string): Promise<void> {
    try {
      this.logger.log(`LocationView 삭제: ${userId}`);
      await UserLocation.delete({ userId });
    } catch (error) {
      this.logger.error(`LocationView 삭제 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

 
  // 현재 위치 조회
  async findCurrentLocation(userId: string): Promise<{ latitude: string; longitude: string } | null> {
    try {
      this.logger.log(`현재 위치 조회: ${userId}`);
      const result = await this.locationViewModel
      .query("userId").eq(userId)
      .using("UserIdIndex")
      .filter("isCurrent").eq(true)
      .exec();

      if (result.length === 0) {
        this.logger.warn(`사용자 ${userId}의 현재 위치 정보가 없습니다.`);
        return null;
      }

      const currentLocation = result[0];
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      };
    } catch (error) {
      this.logger.error(`현재 위치 조회 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

 
 
}