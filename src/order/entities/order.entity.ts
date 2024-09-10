import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column({ type: 'bigint', name: 'user_id', nullable: false })
    userId: number;

    @Column({ type: 'bigint', name: 'total_amount', nullable: false })
    totalAmount: number;

    @Column({ type: 'bigint', name: 'total_price', nullable: false })
    totalPrice: number;

    @Column({ type: 'date', name: 'pickup_time', nullable: false })
    pickupTime: Date;

    @Column({ type: 'varchar', name: 'payment_method', nullable: false })
    paymentMethod: string;

    @Column({ type: 'varchar', name: 'status', nullable: false })
    status: string;

    @Column({ type: 'timestamp', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}