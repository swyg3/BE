// import { AggregateRoot } from "@nestjs/cqrs";
// import { UpdateOrderEvent } from "../events/update-order.event";

// export class UpdateOrderAggregate extends AggregateRoot {
//     private version: number = 0;

//     constructor(
//         private readonly id: string,
//     ) { super(); }

//     // event3. 이벤트 형식 맞추기
//     register(
//         id: string,
//         userId: string,
//         totalAmount: number,
//         totalPrice: number,
//         paymentMethod: string,
//         status: string,
//         items: {
//             orderId: string;
//             productId: number;
//             quantity: number;
//             price: number;
//         }[],
//         pickupTime: Date,
//         createdAt: Date,
//         updatedAt: Date,
//     ) {
//         this.version++;
//         const event = new UpdateOrderEvent(
//             this.id,
//             {
//                 id,
//                 userId,
//                 totalAmount,
//                 totalPrice,
//                 paymentMethod,
//                 status,
//                 items,
//                 pickupTime,
//                 createdAt,
//                 updatedAt,
//             },
//             this.version,
//         );
//         this.apply(event);
//         return event;
//     }
// }