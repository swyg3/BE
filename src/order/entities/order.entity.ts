import { Column, Entity, PrimaryGeneratedColumn, Timestamp } from "typeorm";

@Entity('order')
export class Order {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;
    
    @Column({ type: 'bigint', name: 'user_id', nullable: false })
    userId: number;

    @Column({ type: 'bigint', name: 'total_amount', nullable: false })
    totalAmount: number;

    @Column({ type: 'date', name: 'pickup_time', nullable: false })
    pickupTime: Date;

    @Column({ type: 'enum', name: 'payment_method', nullable: false })
    paymentMethod: Enumerator;

    @Column({ type: 'enum', name: 'status', nullable: false })
    status: Enumerator;

    @Column({ type: 'timestamp', name: 'created_at', nullable: false })
    createdAt: Timestamp;
}