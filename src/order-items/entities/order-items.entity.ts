import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('order_items')
export class order {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;
    
    @Column({ type: 'bigint', name: 'order_id', nullable: false })
    orderId: number;

    @Column({ type: 'bigint', name: 'product_id', nullable: false })
    productId: number;

    @Column({ type: 'bigint', name: 'quantity', nullable: false })
    quantity: number;

    @Column({ type: 'bigint', name: 'price', nullable: false })
    price: number;
}