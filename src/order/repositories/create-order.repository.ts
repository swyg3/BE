import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateOrderEvent } from "../events/create-order.event";

@Injectable()
export class EventRepository {
    constructor(
        @InjectModel('CreateOrderEvent') private readonly eventModel: Model<CreateOrderEvent>,
    ) {}

    // mongoDB에 주문 저장
    async saveEvent(event: CreateOrderEvent): Promise<CreateOrderEvent> {
        const newEvent = new this.eventModel(event);
        return newEvent.save();
    }

    // mongoDB에서 주문 조회
    async findOrdersByUserId(userId: number): Promise<CreateOrderEvent[]> {
        return this.eventModel.find({ userId }).exec();
    }
}