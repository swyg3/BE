import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Category } from "../product.category";
import { Seller } from "src/sellers/entities/seller.entity";

@Entity("product")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Seller, (seller) => seller.products, { eager: true })
  @JoinColumn({ name: 'seller_id', referencedColumnName: 'id' })
  sellerId: Seller; // Seller를 참조하는 외래 키


  @Column({
    type: "enum",
    enum: Category,
    nullable: false,
  })
  category: Category;

  @Column({ type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({
    type: "varchar",
    name: "product_image_url",
    length: 255,
    nullable: true,
  })
  productImageUrl: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "bigint", name: "original_price", nullable: false })
  originalPrice: number;

  @Column({ type: "bigint", name: "discounted_price", nullable: true })
  discountedPrice: number;

  @CreateDateColumn({
    type: "timestamp",
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;
}
