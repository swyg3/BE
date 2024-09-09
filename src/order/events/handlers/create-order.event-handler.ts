import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateOrderEvent } from "../create-order.event";
import { OrderCreate } from "../schemas/create-order.schema";

@EventsHandler(CreateOrderEvent)
export class CreateOrderEventHandler implements IEventHandler<CreateOrderEvent> {
    constructor(
        @InjectModel('OrderCreate')
        private readonly orderCreateModel: Model<OrderCreate>
    ) {}

    async handle(event: CreateOrderEvent): Promise<void> {
        // 이벤트 정보를 mongoDB에 저장
        const createdOrderEvent = new this.orderCreateModel({
            userId: event.userId,
            sellerId: event.sellerId,
            totalAmount: event.totalAmount,
            pickupTime: event.pickupTime,
            paymentMethod: event.paymentMethod,
            status: event.status,
            items: event.items
        });
    
        await createdOrderEvent.save();
    }
}