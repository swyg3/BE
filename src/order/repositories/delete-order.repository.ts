import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectModel, Model } from "nestjs-dynamoose";

// OrderView 인터페이스 정의
export interface OrderView {
    id: string;
    userId: number;
    status: string;
    totalAmount: number;
    pickupTime: Date;
    paymentMethod: string;
    createdAt: Date;
    updatedAt: Date;
}

// OrderItemsView 인터페이스 정의
export interface OrderItemsView {
    id: string;
    orderId: string;
    productId: number;
    quantity: number;
    price: number;
}

@Injectable()
export class DeleteOrderRepository {
    private readonly logger = new Logger(DeleteOrderRepository.name);

    constructor(
        @InjectModel("OrderView")
        private readonly orderViewModel: Model<OrderView, {}>, // OrderView 모델 주입
        @InjectModel("OrderItemsView")
        private readonly orderItemsViewModel: Model<OrderItemsView, {}>, // OrderItemsView 모델 주입
    ) {}

    // 주문 삭제
    async delete(orderId: string): Promise<void> {
        try {
            this.logger.log(`주문 삭제 시도: ${orderId}`);

            // DynamoDB에서 주문 삭제
            await this.orderViewModel.delete({ id: orderId });

            // 해당 주문에 연관된 모든 주문 항목 삭제
            await this.orderItemsViewModel.delete({ orderId }); // orderId로 삭제

            this.logger.log(`주문 및 관련 주문 항목 삭제 완료: ${orderId}`);
        } catch (error) {
            this.logger.error(`주문 삭제 실패: ${error.message}`, error.stack);
            throw new InternalServerErrorException(`주문 삭제 중 오류 발생: ${error.message}`);
        }
    }
}