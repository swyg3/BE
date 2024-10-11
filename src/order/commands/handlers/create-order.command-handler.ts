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
        const { id, userId, totalAmount, totalPrice, pickupTime, items, paymentMethod, status, memo } = command;
    
        try {
            return await this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
                const mergedItems = items.reduce((acc, currentItem) => {
                    const existingItem = acc.find(item => item.productId === currentItem.productId);
                    
                    if (existingItem) {
                        existingItem.quantity += currentItem.quantity;
                    } else {
                        acc.push(currentItem);
                    }
                    
                    return acc;
                }, []);
    
                const newOrder = this.orderRepository.create({
                    id,
                    userId,
                    totalAmount,
                    totalPrice,
                    pickupTime,
                    paymentMethod,
                    status,
                    createdAt: new Date(),
                    memo,
                });
                const savedOrder = await transactionalEntityManager.save(newOrder);
                this.logger.log(`Saved Order: ${JSON.stringify(savedOrder)}`);
    
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
    
                for (const item of mergedItems) {
                    const inventory = await transactionalEntityManager.findOne(Inventory, { where: { productId: item.productId } });
    
                    if (!inventory) {
                        throw new ConflictException(`해당 상품의 재고가 없습니다: ${item.productId}`);
                    }
    
                    if (inventory.quantity < item.quantity) {
                        throw new ConflictException(`재고가 부족합니다: ${item.productId}`);
                    }
    
                    inventory.quantity -= item.quantity;
                    const updatedInventory = await transactionalEntityManager.save(inventory);
                    this.logger.log(`Updated Inventory for product: ${item.productId}, remaining quantity: ${inventory.quantity}`);
    
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
                        memo,
                    },
                    1
                );
    
                await this.eventBusService.publishAndSave(event);
                this.logger.log(`Order event published: ${JSON.stringify(event)}`);
    
                // 주문 정보 반환
                return {
                    success: true,
                    data: {
                        orderId: savedOrder.id,
                        totalAmount: savedOrder.totalAmount,
                        totalPrice: savedOrder.totalPrice,
                        pickupTime: savedOrder.pickupTime,
                        paymentMethod: savedOrder.paymentMethod,
                        status: savedOrder.status,
                        items: savedItems.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                        memo,
                    },
                };
            });
        } catch (error) {
            this.logger.error(`Failed to create order: ${error.message}`);
            throw error;
        }
    }    
}
