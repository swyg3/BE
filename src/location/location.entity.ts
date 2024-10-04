import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  searchTerm: string; // 검색어

  @Column()
  roadAddress: string; // 도로명주소

  @Column()
  latitude: string;

  @Column()
  longitude: string;

  @Column({ default: false })
  isCurrent: boolean;// 현재 선택한 위치이며 계산에 쓰일 위치인지

  @Column({ default: false })
  isAgreed: boolean;// GPS 동의시 TRUE

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}