import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  OneToOne,
} from "typeorm";
import { Category } from "../product.category";
import { Seller } from "src/sellers/entities/seller.entity";
import { PRODUCTS_PUBLIC_IMAGE_PATH } from "./../const/path.const";
import { join } from "path";
import { Transform } from "class-transformer";
import { Inventory } from "src/inventory/inventory.entity";

@Entity("product")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Seller, (seller) => seller.products, { eager: true })
  @JoinColumn({ name: "seller_id", referencedColumnName: "id" })
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
  @Transform(
    ({ value }) => value && `/${join(PRODUCTS_PUBLIC_IMAGE_PATH, value)}`,
  )
  productImageUrl: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "bigint", name: "original_price", nullable: false })
  originalPrice: number;

  @Column({ type: "bigint", name: "discounted_price", nullable: true })
  discountedPrice: number;

  @Column({ type: "timestamp", nullable: true })
  expirationDate: Date;

  @Column({ type: 'varchar', nullable: true })
  locationX: string;

  @Column({ type: 'varchar', nullable: true })
  locationY: string;
  
  @Column({ type: 'float', nullable: true })
  discountRate: number;

  @Column({ type: 'float', nullable: true })
  distance: number;

  @Column({ type: 'float', nullable: true })
  distanceDiscountScore: number;

  @OneToOne(() => Inventory, inventory => inventory.product, { cascade: true })
  inventory: Inventory;
  
  @CreateDateColumn({
    type: "timestamp",
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamp",
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}
