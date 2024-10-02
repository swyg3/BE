import { Injectable, Logger } from "@nestjs/common";
import { DeepPartial, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UserLocation } from "./location.entity";

@Injectable()
export class UserLocationRepository {
  private readonly logger = new Logger(UserLocationRepository.name);

  constructor(
    @InjectRepository(UserLocation)
    private readonly repository: Repository<UserLocation>,
  ) {}

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

  async addLocation(userId: string, latitude: string, longitude: string, isCurrent: boolean): Promise<UserLocation> {
    const existingLocation = await this.repository.findOne({ where: { userId, latitude, longitude } });

    if (existingLocation) {
      existingLocation.isCurrent = isCurrent;
      return await this.repository.save(existingLocation);
    } else {
      return await this.saveUserLocation({ userId, latitude, longitude, isCurrent });
    }
  }
}