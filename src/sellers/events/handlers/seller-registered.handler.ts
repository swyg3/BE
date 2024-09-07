import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { SellerRegisteredEvent } from "../events/register-seller.event";
import { SellerViewRepository } from "src/sellers/repositories/seller-view.repository";

@EventsHandler(SellerRegisteredEvent)
export class SellerRegisteredHandler
  implements IEventHandler<SellerRegisteredEvent>
{
  private readonly logger = new Logger(SellerRegisteredHandler.name);

  constructor(private readonly userViewRepository: SellerViewRepository) {}

  async handle(event: SellerRegisteredEvent) {}
}
