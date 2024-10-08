import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { InventoryUpdatedEvent } from "src/inventory/events/impl/inventory-updated.event";
import { Inventory } from "src/inventory/inventory.entity";
import { OrderItems } from "src/order-items/entities/order-items.entity";
import { Order } from "src/order/entities/order.entity";
import { CreateOrderEvent } from "src/order/events/create-order.event";
import { EventBusService } from "src/shared/infrastructure/event-sourcing";
import { Repository } from 'typeorm';
import { CreateOrderCommand } from "../create-order.command";

@Injectable()
@CommandHandler(CreateOrderCommand)
export class CreateOrderCommandHandler implements ICommandHandler<CreateOrderCommand> {
    private readonly logger = new Logger(CreateOrderCommandHandler.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItems)
        private readonly orderItemsRepository: Repository<OrderItems>,
        private readonly eventBusService: EventBusService,
    ) {}

    async execute(command: CreateOrderCommand): Promise<any> {
        const { id, userId, totalAmount, totalPrice, pickupTime, items, paymentMethod, status } = command;

        try {
            // 트랜잭션 처리 시작
            return await this.orderRepository.manager.transaction(async (transactionalEntityManager) => {

                // 1. 같은 상품 중복 여부 체크 및 수량 합치기
                const mergedItems = items.reduce((acc, currentItem) => {
                    const existingItem = acc.find(item => item.productId === currentItem.productId);
                    
                    if (existingItem) {
                        existingItem.quantity += currentItem.quantity;
                    } else {
                        acc.push(currentItem);
                    }
                    
                    return acc;
                }, []);

                // 2. 주문 생성
                const newOrder = this.orderRepository.create({
                    id,
                    userId,
                    totalAmount,
                    totalPrice,
                    pickupTime,
                    paymentMethod,
                    status,
                    createdAt: new Date(),
                });
                const savedOrder = await transactionalEntityManager.save(newOrder);
                this.logger.log(`Saved Order: ${JSON.stringify(savedOrder)}`);

                // 3. 주문 내역 생성 (병합된 항목으로)
                const orderItems = mergedItems.map(item => {
                    return this.orderItemsRepository.create({
                        orderId: savedOrder.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    });
                });
                const savedItems = await transactionalEntityManager.save(orderItems);
                this.logger.log(`Saved Order Items: ${JSON.stringify(savedItems)}`);

                // 4. 재고 확인 및 차감 + 재고 이벤트 발행
                for (const item of mergedItems) {
                    // 해당 상품의 재고 확인
                    const inventory = await transactionalEntityManager.findOne(Inventory, { where: { productId: item.productId } });

                    if (!inventory) {
                        throw new ConflictException(`해당 상품의 재고가 없습니다: ${item.productId}`);
                    }

                    if (inventory.quantity < item.quantity) {
                        throw new ConflictException(`재고가 부족합니다: ${item.productId}`);
                    }

                    // 재고 차감
                    inventory.quantity -= item.quantity;

                    // 재고 업데이트
                    const updatedInventory = await transactionalEntityManager.save(inventory);
                    this.logger.log(`Updated Inventory for product: ${item.productId}, remaining quantity: ${inventory.quantity}`);

                    // 5. 재고 이벤트 발행
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
                    this.logger.log(`Inventory event published: ${JSON.stringify(inventoryUpdatedEvent)}`);
                }

                // 6. aggregate에서 주문 등록 이벤트 생성
                const event = new CreateOrderEvent(
                    savedOrder.id,
                    {
                        id: savedOrder.id,
                        userId,
                        totalAmount,
                        totalPrice,
                        paymentMethod,
                        status,
                        items: mergedItems.map(item => ({
                            orderId: savedOrder.id,
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                        pickupTime,
                        createdAt: newOrder.createdAt,
                        updatedAt: new Date(),
                    },
                    1
                );

                // 7. 이벤트 발행
                await this.eventBusService.publishAndSave(event);
                this.logger.log(`Order event published: ${JSON.stringify(event)}`);
            });
        } catch (error) {
            this.logger.error(`Failed to create order: ${error.message}`);
            throw error;
        }
    }
}
