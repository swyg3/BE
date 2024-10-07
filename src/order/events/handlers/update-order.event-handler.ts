// import { Injectable, Logger } from "@nestjs/common";
// import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
// import { InjectModel, Model } from "nestjs-dynamoose";
// import { UpdateOrderEvent } from "../update-order.event";

// export interface OrderView {
//     id: string;
//     userId: string;
//     status: string;
//     totalAmount: number;
//     pickupTime: Date;
//     paymentMethod: string;
//     createdAt: Date;
//     updatedAt: Date;
// }

// export interface OrderItemsView {
//     id: string;
//     orderId: string;
//     productId: number;
//     quantity: number;
//     price: number;
// }

// @Injectable()
// @EventsHandler(UpdateOrderEvent)
// export class UpdateOrderEventHandler implements IEventHandler<UpdateOrderEvent> {
//     private readonly logger = new Logger(UpdateOrderEventHandler.name);

//     constructor(
//         @InjectModel("OrderView")
//         private readonly orderViewModel: Model<OrderView, { id: string }>,
//         @InjectModel("OrderItemsView")
//         private readonly orderItemsViewModel: Model<OrderItemsView, { id: string }>,
//     ) {}

//     async handle(event: UpdateOrderEvent) {
//         this.logger.log(`주문 내역 수정중!!`);

//         const pickupTime = new Date(event.data.pickupTime);

//         const updatedOrder: OrderView = {
//             id: event.data.id,
//             userId: event.data.userId,
//             status: event.data.status,
//             totalAmount: event.data.totalAmount,
//             pickupTime: pickupTime,
//             paymentMethod: event.data.paymentMethod,
//             createdAt: new Date(),
//             updatedAt: new Date(),
//         };

//         // DynamoDB에 주문 업데이트
//         await this.orderViewModel.update({ id: updatedOrder.id }, updatedOrder);
//         this.logger.log(`DynamoDB에 주문 내역 업데이트 완료: ${JSON.stringify(updatedOrder)}`);

//         console.log('주문 내역이 수정되었습니다: ', event);
//     }
// }