import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectModel, Model } from "nestjs-dynamoose";
import { v4 as uuidv4 } from "uuid";
import { CreateOrderDto } from "../dtos/create-order.dto";

// OrderView 인터페이스 정의
export interface OrderView {
    id: string;
    userId: string;
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
            this.logger.log(`DynamoDB에 주문 저장 완료: ${JSON.stringify(newOrder)}`);

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
            this.logger.log(`DynamoDB에 모든 주문 항목 저장 완료: ${JSON.stringify(createOrderDto.items)}`);

            return newOrder; // 최종적으로 생성된 주문 반환
        } catch (error) {
            this.logger.error(`주문 생성 실패: ${error.message}`, error.stack);
            this.logger.error(`주문 생성 중 오류 발생: ${JSON.stringify(createOrderDto)}`, error.stack);

            throw new InternalServerErrorException(`주문 생성 중 오류 발생: ${error.message}`);
        }
    }

    // 주문 삭제
    async delete(orderId: string): Promise<void> {
        try {
            this.logger.log(`주문 삭제 시도: ${orderId}`);

            // DynamoDB에서 주문 삭제
            await this.orderViewModel.delete({ id: orderId });
            this.logger.log(`DynamoDB에서 주문 삭제 완료: ${orderId}`);

            // 해당 주문에 연관된 모든 주문 항목 삭제
            await this.orderItemsViewModel.delete({ orderId }); // orderId로 삭제
            this.logger.log(`DynamoDB에서 관련 주문 항목 삭제 완료: ${orderId}`);

        } catch (error) {
            this.logger.error(`주문 삭제 실패: ${error.message}`, error.stack);
            throw new InternalServerErrorException(`주문 삭제 중 오류 발생: ${error.message}`);
        }
    }

    // 주문 업데이트
    async update(orderId: string, updateOrderDto: CreateOrderDto): Promise<OrderView> {
        try {
            this.logger.log(`주문 업데이트 시도: ${orderId}`);
            this.logger.log(`업데이트 데이터: ${JSON.stringify(updateOrderDto)}`);

            // 기존 주문 찾기
            const existingOrder = await this.orderViewModel.get(orderId);
            if (!existingOrder) {
                throw new Error(`Order with ID ${orderId} not found.`);
            }

            // 주문 수정
            const updatedOrder: OrderView = {
                ...existingOrder,
                ...updateOrderDto,
                updatedAt: new Date(), // 수정 시각 업데이트
            };

            // DynamoDB에 업데이트된 주문 저장
            await this.orderViewModel.update(updatedOrder);
            this.logger.log(`DynamoDB에 업데이트된 주문 저장 완료: ${JSON.stringify(updatedOrder)}`);

            // 주문 항목 업데이트 (선택 사항)
            if (updateOrderDto.items) {
                const orderItemsPromises = updateOrderDto.items.map(item => {
                    const updatedOrderItem: OrderItemsView = {
                        id: uuidv4(), // 새로운 UUID 생성 (기존의 항목을 유지하려면 이 부분 수정 필요)
                        orderId: updatedOrder.id, // 업데이트된 주문 ID
                        productId: item.productId, // 제품 ID
                        quantity: item.quantity, // 수량
                        price: item.price, // 가격
                    };
                    return this.orderItemsViewModel.update(updatedOrderItem); // DynamoDB에 주문 항목 업데이트
                });

                await Promise.all(orderItemsPromises); // 모든 주문 항목 업데이트 완료 대기
                this.logger.log(`주문 항목 업데이트 완료: ${orderId}`);
            }

            return updatedOrder; // 최종적으로 업데이트된 주문 반환
        } catch (error) {
            this.logger.error(`주문 업데이트 실패: ${error.message}`, error.stack);
            this.logger.error(`주문 업데이트 중 오류 발생: ${JSON.stringify(updateOrderDto)}`, error.stack);

            throw new InternalServerErrorException(`주문 업데이트 중 오류 발생: ${error.message}`);
        }
    }
}
