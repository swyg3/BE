import { Injectable, Logger } from "@nestjs/common";
import { DeepPartial, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UserLocation } from "./location.entity";
import { LocationType } from "./location.type";

@Injectable()
export class UserLocationRepository {

  private readonly logger = new Logger(UserLocationRepository.name);

  constructor(
    @InjectRepository(UserLocation)
    private readonly repository: Repository<UserLocation>,
  ) { }
  async updateCurrentLocation(userId: string, locationId: string): Promise<UserLocation | null> {
    // PostgreSQL의 트랜잭션을 사용하여 원자적 업데이트 수행
    return this.repository.manager.transaction(async transactionalEntityManager => {
      // 모든 위치의 isCurrent를 false로 설정
      await transactionalEntityManager.update(UserLocation, { userId }, { isCurrent: false });

      // 선택된 위치의 isCurrent를 true로 설정
      await transactionalEntityManager.update(UserLocation, { id: locationId, userId }, { isCurrent: true });

      // 업데이트된 위치 반환
      return transactionalEntityManager.findOne(UserLocation, { where: { id: locationId, userId } });
    });
  }

  async save(location: UserLocation): Promise<UserLocation> {
    return this.repository.save(location);
  }
  async saveUserLocation({
    userId,
    latitude,
    longitude,
    isCurrent = true,
  }: {
    userId: string;
    latitude: string;
    longitude: string;
    isCurrent?: boolean;
  }): Promise<UserLocation> {
    const userLocation = this.repository.create({
      userId,
      latitude,
      longitude,
      isCurrent,
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
    await this.unsetCurrentLocation(userId);

    const userLocation = await this.repository.findOne({ where: { userId, latitude, longitude } });

    if (userLocation) {
      userLocation.isCurrent = true;
      return await this.repository.save(userLocation);
    } else {
      return await this.saveUserLocation({ userId, latitude, longitude, isCurrent: true });
    }
  }

  async findCurrentLocation(userId: string): Promise<UserLocation | null> {
    return await this.repository.findOne({ where: { userId, isCurrent: true } });
  }

  async findUserLocationByUserId(userId: string): Promise<UserLocation[]> {
    return await this.repository.find({ where: { userId } });
  }

  async unsetCurrentLocation(userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(UserLocation)
      .set({ isCurrent: false })
      .where("userId = :userId AND isCurrent = :isCurrent", { userId, isCurrent: true })
      .execute();
  }

  async setAllLocationsToFalse(userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(UserLocation)
      .set({ isCurrent: false })
      .where("userId = :userId", { userId })
      .execute();
  }

  async addLocation(
    userId: string,
    latitude: string,
    longitude: string,
    isCurrent: boolean,
    locationType: LocationType, // 기본값 설정
    isAgreed: boolean,
  ): Promise<UserLocation> {
    // 기존 위치 정보를 조회
    const existingLocation = await this.repository.findOne({ where: { userId, latitude, longitude } });

    if (existingLocation) {
      // 기존 위치 정보가 있으면 필드 업데이트
      existingLocation.isCurrent = isCurrent;
      existingLocation.updatedAt = new Date(); // updatedAt 필드도 업데이트
      return await this.repository.save(existingLocation);
    } else {
      // 새로운 위치 정보 저장
      const newLocation = this.repository.create({
        userId,
        latitude,
        longitude,
        isCurrent,
        locationType: locationType, // 기본값 설정
        isAgreed: isAgreed, // 기본값 설정
        updatedAt: new Date() // 현재 날짜로 설정
      });

      return await this.repository.save(newLocation);
    }
  }
}