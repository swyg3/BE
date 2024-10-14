import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('orders')
export class Order {
    @PrimaryColumn('uuid')
    id: string;
    
    @Column({ type: 'varchar', name: 'user_id', nullable: false })
    userId: string;

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

    @Column({ type: 'simple-array', name: 'memo', nullable: true, transformer: {
        to: (value: boolean[]): string => value ? value.map(v => (v ? '1' : '0')).join(',') : '',
        from: (value: string): boolean[] => value.split(',').map(v => v === '1'),
    }, })
    memo: boolean[];
}