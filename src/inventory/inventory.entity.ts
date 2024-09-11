import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('inventory')
export class Inventory {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'bigint', name: 'product_id', nullable: false })
    productId: number;

    @Column({ type: 'bigint', nullable: false })
    quantity: number;

    @Column({ type: 'date', name: 'expiration_date', nullable: true })
    expirationDate: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        name: 'updated_at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;

}
