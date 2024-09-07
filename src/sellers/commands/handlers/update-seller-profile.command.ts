import { CommandHandler, ICommandHandler, EventBus } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Seller } from "src/sellers/entities/seller.entity";
import { UpdateSellerProfileCommand } from "../commands/update-seller-profile.command";

@CommandHandler(UpdateSellerProfileCommand)
export class UpdateSellerProfileHandler
  implements ICommandHandler<UpdateSellerProfileCommand>
{
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateSellerProfileCommand) {}
}
