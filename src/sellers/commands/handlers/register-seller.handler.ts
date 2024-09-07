import { Logger, Inject } from "@nestjs/common";
import { CommandHandler, ICommandHandler, EventBus } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import Redis from "ioredis";
import { EventStoreService } from "src/shared/infrastructure/event-store/event-store.service";
import { REDIS_CLIENT } from "src/shared/infrastructure/redis/redis.config";
import { RegisterUserHandler } from "src/users/commands/handlers/register-user.handler";
import { PasswordService } from "src/users/services/password.service";
import { Repository } from "typeorm";
import { RegisterSellerCommand } from "../commands/register-seller.command";
import { Seller } from "src/sellers/entities/seller.entity";

@CommandHandler(RegisterSellerCommand)
export class RegisterSellerHandler
  implements ICommandHandler<RegisterSellerCommand>
{
  private readonly logger = new Logger(RegisterUserHandler.name);

  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    private readonly eventStoreService: EventStoreService,
    private readonly passwordService: PasswordService,
    @Inject(EventBus) private readonly eventBus: EventBus,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  async execute(command: RegisterSellerCommand): Promise<any> {}
}
