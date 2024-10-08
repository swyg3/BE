import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('order_items')
export class OrderItems {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column({ type: 'uuid', name: 'order_id', nullable: false })
    orderId: string;

    @Column({ type: 'uuid', name: 'product_id', nullable: false })
    productId: string;

    @Column({ type: 'bigint', name: 'quantity', nullable: false })
    quantity: number;

    @Column({ type: 'bigint', name: 'price', nullable: false })
    price: number;
}