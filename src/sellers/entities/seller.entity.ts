import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

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

  @Column()
  isBusinessNumberVerified: boolean;

  @Column()
  isEmailVerified: boolean;

  @Column()
  accessToken: string;

  @Column()
  lastLoginAt: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}
