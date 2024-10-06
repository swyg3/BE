import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User {
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
}
