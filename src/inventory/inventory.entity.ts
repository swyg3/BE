import { Product } from "src/product/entities/product.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
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

  @OneToOne(() => Product, product => product.inventory)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @UpdateDateColumn({
    type: "timestamp",
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}
