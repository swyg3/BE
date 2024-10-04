import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { LocationType } from "./location.type";

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
  isCurrent: boolean;// 현재 선택한 위치이며 계산에 쓰일 위치인지

  @Column({
    type: 'enum',
    enum: LocationType,
    default: LocationType.SEARCH
  })
  locationType: LocationType;// 실시간 위치인지 검색 위치 인지 

  @Column({ default: false })
  isAgreed: boolean;// GPS 동의시 TRUE

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}