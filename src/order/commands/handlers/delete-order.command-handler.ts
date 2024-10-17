import { Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { InventoryUpdatedEvent } from "src/inventory/events/impl/inventory-updated.event";
import { Inventory } from "src/inventory/inventory.entity";
import { OrderItems } from "src/order-items/entities/order-items.entity";
import { Order } from "src/order/entities/order.entity";
import { DeleteOrderEvent } from "src/order/events/delete-order.event";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";
import { Repository } from "typeorm";
import { DeleteOrderCommand } from "../delete-order.command";

@Injectable()
@CommandHandler(DeleteOrderCommand)
export class DeleteOrderCommandHandler implements ICommandHandler<DeleteOrderCommand> {
    private readonly logger = new Logger(DeleteOrderCommandHandler.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItems)
        private readonly orderItemsRepository: Repository<OrderItems>,
        private readonly eventBusService: EventBusService,
    ) {}

    async execute(command: DeleteOrderCommand): Promise<any> {
        const { id } = command;

        // 1. 주문 및 주문 아이템 조회
        const order = await this.orderRepository.findOne({ where: { id } });
        const orderItems = await this.orderItemsRepository.find({ where: { orderId: id } });

        if (!order) {
            this.logger.error(`Order with ID ${id} not found.`);
            throw new Error(`Order with ID ${id} not found.`);
        }

        try {
            // 트랜잭션 처리 시작
            return await this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
                // 2. 재고 복구
                for (const item of orderItems) {
                    const inventory = await transactionalEntityManager.findOne(Inventory, { where: { productId: item.productId } });

                    if (!inventory) {
                        throw new Error(`Inventory for product ${item.productId} not found.`);
                    }

                    this.logger.log(`Product ID: ${item.productId}`);
                    this.logger.log(`Current inventory quantity: ${inventory.quantity}`);
                    this.logger.log(`Order item quantity: ${item.quantity}`);

                    // bigint로 안전하게 계산
                    const currentQuantity = BigInt(inventory.quantity);
                    const addQuantity = BigInt(item.quantity);
                    const newQuantity = currentQuantity + addQuantity;

                    this.logger.log(`New calculated quantity: ${newQuantity.toString()}`);

                    // 결과가 Number.MAX_SAFE_INTEGER를 초과하는지 확인
                    if (newQuantity > BigInt(Number.MAX_SAFE_INTEGER)) {
                        throw new Error(`Inventory quantity for product ${item.productId} exceeds maximum safe integer value`);
                    }

                    // bigint를 number로 변환하여 저장
                    inventory.quantity = Number(newQuantity);

                    // 주문한 수량만큼 재고 추가
                    // inventory.quantity += item.quantity;

                    // 재고 업데이트
                    const updatedInventory = await transactionalEntityManager.save(inventory);
                    this.logger.log(`Restored Inventory for product: ${item.productId}, new quantity: ${updatedInventory.quantity}`);

                    // 재고 이벤트 발행
                    const inventoryUpdatedEvent = new InventoryUpdatedEvent(
                        updatedInventory.id,
                        {
                            productId: updatedInventory.productId,
                            quantity: updatedInventory.quantity,
                            expirationDate: updatedInventory.expirationDate,
                            updatedAt: new Date(),
                        },
                        1
                    );

                    await this.eventBusService.publishAndSave(inventoryUpdatedEvent);
                    this.logger.log(`Inventory update event published: ${JSON.stringify(inventoryUpdatedEvent)}`);
                }

                // 3. 주문 및 주문 아이템 삭제
                await transactionalEntityManager.remove(order);
                await transactionalEntityManager.remove(orderItems);

                //await this.orderRepository.delete({ id });
                //await this.orderItemsRepository.delete({ orderId: id });

                // 4. 주문 삭제 이벤트 생성
                const event = new DeleteOrderEvent(
                    order.id,
                    {
                        id: order.id,
                        userId: order.userId,
                        totalAmount: order.totalAmount,
                        totalPrice: order.totalPrice,
                        paymentMethod: order.paymentMethod,
                        status: 'CANCELLED',
                        items: orderItems.map(item => ({
                            id: item.id,
                            orderId: item.orderId,
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                        pickupTime: order.pickupTime,
                        createdAt: order.createdAt,
                        updatedAt: new Date(),
                        memo: order.memo,
                    },
                    1
                );

                // 5. 주문 삭제 이벤트 발행
                await this.eventBusService.publishAndSave(event);
                this.logger.log(`Order deletion event published: ${JSON.stringify(event)}`);


                return { success: true, message: `Order ${id} successfully deleted` };
            });
        } catch (error) {
            this.logger.error(`Failed to delete order: ${error.message}`);
            throw error;
        }
    }
}