import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

@Entity("access_logs")
export class AccessLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  userType: "user" | "seller";

  @Column()
  action: string;

  @Column({ nullable: true })
  loginMethod?: string;

  @Column()
  timestamp: Date;

  @Column({ nullable: true })
  ip?: string;

  @Column({ nullable: true })
  userAgent?: string;
}
