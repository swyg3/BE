import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { PaymentMethod, Status } from "../enums/order.enum";

@Entity('order')
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

    @Column({ type: 'enum', name: 'payment_method', nullable: false })
    paymentMethod: PaymentMethod;

    @Column({ type: 'enum', name: 'status', nullable: false })
    status: Status;

    @Column({ type: 'timestamp', name: 'created_at', nullable: false })
    createdAt: Date;
}