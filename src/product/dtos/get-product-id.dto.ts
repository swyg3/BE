import { ApiProperty } from '@nestjs/swagger';

export class GetProductByIdResponseDto {
  @ApiProperty({ description: '상품 ID' })
  productId: string;

  @ApiProperty({ description: 'GSI Key' })
  GSI_KEY: string;

  @ApiProperty({ description: '판매자 ID' })
  sellerId: string;

  @ApiProperty({ description: '카테고리' })
  category: string;

  @ApiProperty({ description: '상품 이름' })
  name: string;

  @ApiProperty({ description: '상품 이미지 URL' })
  productImageUrl: string;

  @ApiProperty({ description: '상품 설명' })
  description: string;

  @ApiProperty({ description: '원래 가격' })
  originalPrice: number;

  @ApiProperty({ description: '할인 가격' })
  discountedPrice: number;

  @ApiProperty({ description: '할인율' })
  discountRate: number;

  @ApiProperty({ description: '재고' })
  availableStock: number;

  @ApiProperty({ description: '유효 기간' })
  expirationDate: Date;

  @ApiProperty({ description: '생성 날짜' })
  createdAt: Date;

  @ApiProperty({ description: '업데이트 날짜' })
  updatedAt: Date;

  @ApiProperty({ description: '위치 X' })
  locationX: string;

  @ApiProperty({ description: '위치 Y' })
  locationY: string;

  @ApiProperty({ description: '거리' })
  distance: number;

  @ApiProperty({ description: '거리 할인 점수' })
  distanceDiscountScore: number;

  @ApiProperty({ description: '재고 업데이트 날짜' })
  inventoryUpdatedAt: Date;

  @ApiProperty({ description: '가게 이름' })
  storeName: string;

  @ApiProperty({ description: '가게 주소' })
  storeAddress: string;

  @ApiProperty({ description: '가게 전화번호' })
  storeNumber: string;
}
