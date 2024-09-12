import { Injectable } from "@nestjs/common";
import { CreateOrderEvent } from "../events/create-order.event";
import { EventRepository } from "../repositories/create-order.repository";

@Injectable()
export class OrderService {
    constructor(private readonly eventRepository: EventRepository) {}

    // 사용자 ID로 주문 조회
    async getOrdersByUserId(userId: number): Promise<CreateOrderEvent[]> {
        return this.eventRepository.findOrdersByUserId(userId);
    }
}