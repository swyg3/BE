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

  @Column({ type: 'boolean', default: false })
  isBusinessNumberVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  accessToken: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}
