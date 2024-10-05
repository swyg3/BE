import { Injectable, Logger } from "@nestjs/common";
import { DeepPartial, EntityManager, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UserLocation2 } from "./location.entity";

@Injectable()
export class UserLocationRepository {

  private readonly logger = new Logger(UserLocationRepository.name);

  constructor(
    @InjectRepository(UserLocation2)
    private readonly repository: Repository<UserLocation2>,
  ) { }
  
  async updateCurrentLocation(
    userId: string,
    id: string,
    transactionalEntityManager?: EntityManager
  ): Promise<UserLocation2 | null> {
    const manager = transactionalEntityManager || this.repository.manager;

    return manager.transaction(async transactionalEntityManager => {
      try {
        this.logger.debug(`Starting updateCurrentLocation for user: ${userId}, location: ${id}`);

        // 먼저 선택된 위치가 존재하는지 확인
        const locationExists = await transactionalEntityManager.findOne(UserLocation2, {
          where: { id: id, userId }
        });

        if (!locationExists) {
          this.logger.warn(`Location not found for user: ${userId}, location: ${id}`);
          return null;
        }

        // 모든 위치의 isCurrent를 false로 설정
        const updateAllResult = await transactionalEntityManager.update(
          UserLocation2,
          { userId },
          { isCurrent: false }
        );
        this.logger.debug(`Updated all locations: ${updateAllResult.affected} rows affected`);

        // 선택된 위치의 isCurrent를 true로 설정
        const updateSelectedResult = await transactionalEntityManager.update(
          UserLocation2,
          { id: id, userId },
          { isCurrent: true }
        );
        this.logger.debug(`Updated selected location: ${updateSelectedResult.affected} rows affected`);

        // 업데이트된 위치 반환
        const updatedLocation = await transactionalEntityManager.findOne(UserLocation2, {
          where: { id: id, userId }
        });

        if (!updatedLocation) {
          throw new Error('Failed to retrieve updated location');
        }

        this.logger.log(`Successfully updated current location for user: ${userId}`);
        return updatedLocation;
      } catch (error) {
        this.logger.error(`Failed to update current location for user: ${userId}`, error.stack);
        throw error;
      }
    });
  }


  async save(location: UserLocation2): Promise<UserLocation2> {
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
  }): Promise<UserLocation2> {
    const userLocation = this.repository.create({
      userId,
      latitude,
      longitude,
      isCurrent,
    } as DeepPartial<UserLocation2>);

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
  }): Promise<UserLocation2> {
    await this.unsetCurrentLocation(userId);

    const userLocation = await this.repository.findOne({ where: { userId, latitude, longitude } });

    if (userLocation) {
      userLocation.isCurrent = true;
      return await this.repository.save(userLocation);
    } else {
      return await this.saveUserLocation({ userId, latitude, longitude, isCurrent: true });
    }
  }

  async findCurrentLocation(userId: string): Promise<UserLocation2 | null> {
    return await this.repository.findOne({ where: { userId, isCurrent: true } });
  }

  async findUserLocationByUserId(userId: string): Promise<UserLocation2[]> {
    return await this.repository.find({ where: { userId } });
  }

  async unsetCurrentLocation(userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(UserLocation2)
      .set({ isCurrent: false })
      .where("userId = :userId AND isCurrent = :isCurrent", { userId, isCurrent: true })
      .execute();
  }

  async setAllLocationsToFalse(userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(UserLocation2)
      .set({ isCurrent: false })
      .where("userId = :userId", { userId })
      .execute();
  }

  async addLocation(
    userId: string,
    latitude: string,
    longitude: string,
    isCurrent: boolean,
    isAgreed: boolean,
  ): Promise<UserLocation2> {
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
        isAgreed: isAgreed, // 기본값 설정
        updatedAt: new Date() // 현재 날짜로 설정
      });

      return await this.repository.save(newLocation);
    }
  }
}