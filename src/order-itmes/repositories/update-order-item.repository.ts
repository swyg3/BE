import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderEvent } from 'src/order/events/create-order.event';

@Injectable()
export class OrderItemRepository {
    constructor(
        @InjectModel(CreateOrderEvent.name) private readonly eventModel: Model<CreateOrderEvent>,
    ) {}

    // 주문 수정
}
