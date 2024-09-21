import { Schema } from 'dynamoose';

// UserView 스키마 정의
export const DyUserSchema = new Schema(
  {
    userId: {
      type: String,
      hashKey: true, // 파티션 키로 설정 (고유 식별자)
    },
    email: {
      type: String,
      required: true,
      index: {
        name: 'EmailIndex', // 인덱스 이름
        type: 'global',     // 글로벌 보조 인덱스로 설정
        rangeKey: 'createdAt', // 선택적 정렬 키 설정 (필요 시)
        project: true, // 프로젝트된 속성을 설정 (옵션)
      },
    },
    name: {
      type: String,
      required: true, // 필수 속성
    },
    phoneNumber: {
      type: String,
      required: true, // 필수 속성
    },
    isEmailVerified: {
      type: Boolean,
      default: false, // 기본값 설정
    },
    lastLoginAt: {
      type: Date,
      default: null, // 기본값 설정
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt', // 자동 생성 시간 설정
      updatedAt: 'updatedAt', // 자동 수정 시간 설정
    },
    saveUnknown: false, // 스키마에 정의되지 않은 속성의 저장을 방지
  }
);
