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

@Injectable()
export class CreateOrderRepository {
    private readonly logger = new Logger(CreateOrderRepository.name);

    constructor(
        @InjectModel("OrderView")
        private readonly orderViewModel: Model<OrderView, {}>, // OrderView 모델로 변경
    ) {}

    // 주문 생성
    async create(createOrderDto: CreateOrderDto): Promise<OrderView> {
        try {
            this.logger.log(`주문 생성 시도: ${createOrderDto.userId}`);
            this.logger.log(`주문 데이터: ${JSON.stringify(createOrderDto)}`);

            const newOrder: OrderView = {
                id: uuidv4(),
                userId: createOrderDto.userId,
                status: createOrderDto.status,
                totalAmount: createOrderDto.totalAmount,
                pickupTime: createOrderDto.pickupTime,
                paymentMethod: createOrderDto.paymentMethod,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // DynamoDB에 저장
            return await this.orderViewModel.create(newOrder);
        } catch (error) {
            this.logger.error(`주문 생성 실패: ${error.message}`, error.stack);
            this.logger.error(`주문 생성 중 오류 발생: ${JSON.stringify(createOrderDto)}`, error.stack);

            throw new InternalServerErrorException(`주문 생성 중 오류 발생: ${error.message}`);
        }
    }
}