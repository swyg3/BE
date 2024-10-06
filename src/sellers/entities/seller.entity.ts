import { Product } from "src/product/entities/product.entity";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";

@Entity("sellers")
export class Seller {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column()
  storeName: string;

  @Column()
  storeAddress: string;

  @Column()
  storePhoneNumber: string;

  @Column({ type: "boolean", default: false })
  isBusinessNumberVerified: boolean;

  @Column({ type: "boolean", default: false })
  isEmailVerified: boolean;

  @Column({ type: "boolean", default: false })
  isDeleted: boolean;

  @Column({ type: "boolean", default: false })
  agreeReceiveLocation: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @Column({ type: "timestamp", default: null, nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => Product, (product) => product.sellerId)
  products: Product[];
}
