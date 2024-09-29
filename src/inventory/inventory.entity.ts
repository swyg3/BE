import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("inventory")
export class Inventory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "product_id", nullable: false })
  productId: string;

  @Column({ type: "bigint", nullable: false })
  quantity: number;

  @Column({ type: "date", name: "expiration_date", nullable: true })
  expirationDate: Date;

  @UpdateDateColumn({
    type: "timestamp",
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}
