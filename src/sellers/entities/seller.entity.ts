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

  @Column({ nullable: true })
  accessToken: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  // Seller와 Product의 일대다 관계 설정
  @OneToMany(() => Product, (product) => product.sellerId)
  products: Product[];
}
