import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectModel, Model } from "nestjs-dynamoose";
import { v4 as uuidv4 } from "uuid";
import { CreateOrderDto } from "../dtos/create-order.dto";

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
    orderId: string; // 주문 ID
    productId: number; // 제품 ID
    quantity: number; // 수량
    price: number; // 가격
}

@Injectable()
export class CreateOrderRepository {
    private readonly logger = new Logger(CreateOrderRepository.name);

    constructor(
        @InjectModel("OrderView")
        private readonly orderViewModel: Model<OrderView, {}>, // OrderView 모델 주입
        @InjectModel("OrderItemsView")
        private readonly orderItemsViewModel: Model<OrderItemsView, {}>, // OrderItemsView 모델 주입
    ) {}

    // 주문 생성
    async create(createOrderDto: CreateOrderDto): Promise<OrderView> {
        try {
            this.logger.log(`주문 생성 시도: ${createOrderDto.userId}`);
            this.logger.log(`주문 데이터: ${JSON.stringify(createOrderDto)}`);

            // 새로운 주문 생성
            const newOrder: OrderView = {
                id: uuidv4(), // UUID 생성
                userId: createOrderDto.userId,
                status: createOrderDto.status,
                totalAmount: createOrderDto.totalAmount,
                pickupTime: createOrderDto.pickupTime,
                paymentMethod: createOrderDto.paymentMethod,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // DynamoDB에 주문 저장
            await this.orderViewModel.create(newOrder);

            // 주문 항목 저장
            const orderItemsPromises = createOrderDto.items.map(item => {
                const newOrderItem: OrderItemsView = {
                    id: uuidv4(), // 주문 항목에 대한 UUID 생성
                    orderId: newOrder.id, // 생성된 주문 ID
                    productId: item.productId, // 제품 ID
                    quantity: item.quantity, // 수량
                    price: item.price, // 가격
                };
                return this.orderItemsViewModel.create(newOrderItem); // DynamoDB에 주문 항목 저장
            });

            await Promise.all(orderItemsPromises); // 모든 주문 항목 저장 완료 대기

            return newOrder; // 최종적으로 생성된 주문 반환
        } catch (error) {
            this.logger.error(`주문 생성 실패: ${error.message}`, error.stack);
            this.logger.error(`주문 생성 중 오류 발생: ${JSON.stringify(createOrderDto)}`, error.stack);

            throw new InternalServerErrorException(`주문 생성 중 오류 발생: ${error.message}`);
        }
    }
}
