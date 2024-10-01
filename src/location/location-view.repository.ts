import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

export interface LocationView {
  userId: string;
  latitude: string;
  longitude: string;
  isCurrent?: boolean; 
  updatedAt: Date;
}

@Injectable()
export class LocationViewRepository {
  private readonly logger = new Logger(LocationViewRepository.name);

  constructor(
    @InjectModel("LocationView")
    private readonly locationViewModel: Model<
      LocationView,
      { userId: string }
    >,
    private readonly configService: ConfigService
  ) { }

  // 위치 정보 생성
  async createUserLocationView(locationView: LocationView): Promise<LocationView> {
    try {
      this.logger.log(`LocationView 생성: ${locationView.userId}`);
      this.logger.log(`Attempting to create LocationView: ${JSON.stringify(locationView)}`);
      return await this.locationViewModel.create(locationView);
    } catch (error) {
      this.logger.error(`LocationView 생성 실패: ${error.message}`, error.stack);
      this.logger.error(`Failed to create LocationView: ${JSON.stringify(locationView)}`, error.stack);
      throw error;
    }
  }

  // 위치 정보 수정
  async update(userId: string, updates: Partial<LocationView>): Promise<LocationView> {
    try {
      this.logger.log(`LocationView 수정: ${userId}`);
      this.logger.log(`Attempting to update LocationView: ${JSON.stringify(updates)}`);

      const updatedLocation = await this.locationViewModel.findOneAndUpdate(
        { userId },
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!updatedLocation) {
        throw new Error(`LocationView not found for userId: ${userId}`);
      }

      return updatedLocation;
    } catch (error) {
      this.logger.error(`LocationView 수정 실패: ${error.message}`, error.stack);
      this.logger.error(`Failed to update LocationView: ${userId}`, error.stack);
      throw error;
    }
  }

  // 위치 정보 추가
  async addLocation(userId: string, location: { latitude: number; longitude: number }): Promise<LocationView> {
    try {
      this.logger.log(`LocationView에 위치 추가: ${userId}`);
      this.logger.log(`Attempting to add location to LocationView: ${JSON.stringify(location)}`);

      const updatedLocationView = await this.locationViewModel.findOneAndUpdate(
        { userId },
        {
          $push: { locations: location },
          $set: { updatedAt: new Date() }
        },
        { new: true, runValidators: true }
      );

      if (!updatedLocationView) {
        throw new Error(`LocationView not found for userId: ${userId}`);
      }

      this.logger.log(`Location 추가 성공: ${userId}`);
      return updatedLocationView;
    } catch (error) {
      this.logger.error(`Location 추가 실패: ${error.message}`, error.stack);
      this.logger.error(`Failed to add location to LocationView: ${userId}`, error.stack);
      throw error;
    }
  }

  // 위치 정보 조회
  async findById(userId: string): Promise<LocationView | null> {
    try {
      this.logger.log(`LocationView 조회: ${userId}`);
      return await this.locationViewModel.findOne({ userId });
    } catch (error) {
      this.logger.error(`LocationView 조회 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  // 위치 정보 삭제
  async delete(userId: string): Promise<void> {
    try {
      this.logger.log(`LocationView 삭제: ${userId}`);
      await this.locationViewModel.deleteOne({ userId });
    } catch (error) {
      this.logger.error(`LocationView 삭제 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAllUserLocations(userId: string): Promise<LocationView[]> {
    try {
      this.logger.log(`모든 LocationView 조회: ${userId}`);
      const locations = await this.locationViewModel.find({ userId }).exec();
      
      if (locations.length === 0) {
        this.logger.log(`사용자 ${userId}의 위치 정보가 없습니다.`);
      } else {
        this.logger.log(`사용자 ${userId}의 ${locations.length}개 위치 정보를 조회했습니다.`);
      }
      
      return locations;
    } catch (error) {
      this.logger.error(`사용자의 모든 LocationView 조회 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  // 현재 위치 조회
async findCurrentLocation(userId: string): Promise<{ latitude: string; longitude: string } | null> {
  try {
    this.logger.log(`현재 위치 조회: ${userId}`);
    const currentLocation = await this.locationViewModel.findOne({ userId, isCurrent: true });

    if (!currentLocation) {
      this.logger.warn(`사용자 ${userId}의 현재 위치 정보가 없습니다.`);
      return null;
    }

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