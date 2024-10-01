import { Injectable } from "@nestjs/common";
import { DeepPartial, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UserLocation } from "./location.entity";

@Injectable()
export class UserLocationRepository {
  findCurrentLocation(userId: any) {
      throw new Error('Method not implemented.');
  }
  createUserLocationView(arg0: { id: string; userId: string; latitude: string; longitude: string; createdAt: Date; updatedAt: Date; }) {
      throw new Error("Method not implemented.");
  }
  constructor(
    @InjectRepository(UserLocation)
    private readonly repository: Repository<UserLocation>,
  ) {}

  async saveUserLocation({
    userId,
    latitude,
    longitude,
    isCurrent = true, // 기본값으로 true 설정
  }: {
    userId: string;
    latitude: string;
    longitude: string;
    isCurrent?: boolean; // isCurrent 속성 추가
  }): Promise<UserLocation> {
    // UserLocation 객체 생성 시 isCurrent 포함
    const userLocation = this.repository.create({
      userId,
      latitude,
      longitude,
      isCurrent, // isCurrent를 여기에서 사용
    } as DeepPartial<UserLocation>);
  
    return await this.repository.save(userLocation);
  }

  async setCurrentLocation({
    userId,
    latitude,
    longitude,
  }: {
    userId: string;
    latitude: string;
    longitude: string;
  }): Promise<UserLocation> {
    let userLocation = await this.repository.findOne({ where: { userId } });

    if (!userLocation) {
      userLocation = this.repository.create({ userId } as DeepPartial<UserLocation>);
    }

    userLocation.latitude = latitude;
    userLocation.longitude = longitude;

    return await this.repository.save(userLocation);
  }

  async findUserLocationByUserId(userId: string): Promise<UserLocation | null> {
    return await this.repository.findOne({ where: { userId } });
  }


  async getCurrentLocation(userId: string): Promise<string | null> {
    try {
      const user = await this.repository.findOne({ where: { id: userId }, select: ['currentLocationId'] });
      return user ? user.currentLocationId : null;
    } catch (error) {
      this.logger.error(`Failed to get user current location: ${error.message}`, error.stack);
      throw error;
    }
  }

  //현 위치 해제
  async unsetCurrentLocation(userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(UserLocation)
      .set({ isCurrent: false }) // isCurrent를 false로 설정
      .where("userId = :userId AND isCurrent = :isCurrent", { userId, isCurrent: true })
      .execute();
  }

}