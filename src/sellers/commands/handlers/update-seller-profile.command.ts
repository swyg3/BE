import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Seller } from "src/sellers/entities/seller.entity";
import { UpdateSellerProfileCommand } from "../commands/update-seller-profile.command";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";
import { NotFoundException } from "@nestjs/common";
import { SellerProfileUpdatedEvent } from "src/sellers/events/events/update-seller-profile.event";

@CommandHandler(UpdateSellerProfileCommand)
export class UpdateSellerProfileHandler
  implements ICommandHandler<UpdateSellerProfileCommand>
{
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: UpdateSellerProfileCommand) {
    const { sellerId, updateData } = command;

    const seller = await this.sellerRepository.findOne({
      where: { id: sellerId },
    });
    if (!seller) {
      throw new NotFoundException("존재하지 않는 회원입니다.");
    }

    // 변경 가능한 필드만 업데이트
    if (updateData.name !== undefined) seller.name = updateData.name;
    if (updateData.phoneNumber !== undefined)
      seller.phoneNumber = updateData.phoneNumber;

    await this.sellerRepository.save(seller);

    // 이벤트 발행 및 저장
    const version = 1;
    const sellerProfileUpdatedEvent = new SellerProfileUpdatedEvent(
      sellerId,
      updateData,
      version,
    );

    await this.eventBusService.publishAndSave(sellerProfileUpdatedEvent);

    return seller;
  }
}
