import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CompleteSellerProfileCommand } from "../commands/complete-seller-profile.command";
import { Inject } from "@nestjs/common";
import { REDIS_CLIENT } from "src/shared/infrastructure/redis/redis.config";
import Redis from "ioredis";

@CommandHandler(CompleteSellerProfileCommand)
export class CompleteSellerProfileHandler
  implements ICommandHandler<CompleteSellerProfileCommand>
{
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  async execute(command: CompleteSellerProfileCommand) {
    const { email, storeName, storeAddress, storePhoneNumber } =
      command.profileData;

    // Redis에 프로필 정보 저장
    await this.storeProfileInRedis(email, {
      storeName,
      storeAddress,
      storePhoneNumber,
    });

    return {
      email,
      message: "판매자 프로필이 성공적으로 저장되었습니다.",
    };
  }
  private async storeProfileInRedis(
    email: string,
    profileData: any,
  ): Promise<void> {
    const key = `seller_profile:${email}`;
    await this.redisClient.hmset(key, profileData);
    await this.redisClient.expire(key, 3600); // 1시간 후 만료
  }
}
