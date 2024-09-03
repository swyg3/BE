
import { ProductCreatedEvent } from '../events/impl/product-created.event';
import { Category } from '../entities/product.entity';
import { AggregateRoot } from '@nestjs/cqrs';


export class ProductAggregate extends AggregateRoot {
    constructor(private readonly id: number) {
        super();
    }


    createProduct(
        sellerId: number,
        category: Category,
        name: string,
        productImageUrl: string,
        description: string,
        originalPrice: number,
        discountedPrice: number,
    ) {
        const expirationDate = new Date();

        // 이벤트 생성 시 만기일 설정
        const event = new ProductCreatedEvent(
            this.id,
            sellerId,
            category,
            name,
            productImageUrl,
            description,
            originalPrice,
            discountedPrice,
            0,              // discountRate, 기본값으로 설정
            0,              // availableStock, 기본값으로 설정
            expirationDate, // 만기일을 설정한 날짜로 지정
            new Date(),     // createdAt, 현재 날짜
            new Date()      // updatedAt, 현재 날짜
        );



        this.apply(event);
        return [event];
    }
}