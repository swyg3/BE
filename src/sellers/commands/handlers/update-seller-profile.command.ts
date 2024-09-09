import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Seller } from "src/sellers/entities/seller.entity";
import { UpdateSellerProfileCommand } from "../commands/update-seller-profile.command";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";

@CommandHandler(UpdateSellerProfileCommand)
export class UpdateSellerProfileHandler
  implements ICommandHandler<UpdateSellerProfileCommand>
{
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: UpdateSellerProfileCommand) {}
}
