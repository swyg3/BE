/*import { AggregateRoot } from '@nestjs/cqrs';
import { InventoryCreatedEvent } from './../events/impl/inventory-created.event';
import { InventoryDeletedEvent } from '../events/impl/inventory-deleted.event';

export class InventoryAggregate extends AggregateRoot {
    private Id: number;
    private productId: number;
    private quantity: number;
    private expirationDate: Date;
    private createdAt: Date;
    private updatedAt: Date;

    constructor(Id: number, productId: number, quantity: number, expirationDate: Date, createdAt: Date, updatedAt: Date) {
        super();
        this.Id = Id;
        this.productId = productId;
        this.quantity = quantity;
        this.expirationDate = expirationDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // 인벤토리 생성
    createInventory(productId: number, quantity: number, expirationDate: Date) {
        const event = new InventoryCreatedEvent(
            this.Id,
            productId,
            quantity,
            expirationDate,
            this.createdAt,
            new Date() // updatedAt을 현재 날짜로 설정
        );
        this.apply(event);
        return event;
    }

    // 인벤토리 삭제
    deleteInventory() {
        const event = new  InventoryDeletedEvent(this.Id);
        this.apply(event);
        return event;
    }

   /* // 인벤토리 업데이트
    updateInventory(productId?: number, quantity?: number, expirationDate?: Date) {
        if (productId) this.productId = productId;
        if (quantity) this.quantity = quantity;
        if (expirationDate) this.expirationDate = expirationDate;

        const event = new ProductUpdatedEvent(
            this.Id,
            this.productId,
            this.quantity,
            this.expirationDate,
            new Date() // 업데이트 시점에 updatedAt을 현재 날짜로 설정
        );
        this.apply(event);
        return event;
    }*/
