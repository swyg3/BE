import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  latitude: string;

  @Column()
  longitude: string;

  @Column({ default: false })
  isCurrent: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}