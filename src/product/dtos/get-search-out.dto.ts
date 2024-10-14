import { ApiProperty } from "@nestjs/swagger";
import { ProductView } from "../repositories/product-view.repository";

export class SearchProductsQueryOutputDto {
 
    @ApiProperty({ description: '요청 성공 여부', example: true })
    success: boolean;
  
    @ApiProperty({ description: '응답 메시지', example: '해당 상품 리스트 조회를 성공했습니다.' })
    message: string;
  
    @ApiProperty({ description: '조회된 상품 목록' })
    items: ProductView[];
  
    @ApiProperty({ description: '마지막으로 평가된 항목의 URL', required: false })
    lastEvaluatedUrl: string | null;
  
    @ApiProperty({ description: '첫 번째로 평가된 항목의 URL', required: false })
    firstEvaluatedUrl: string | null;
  
    @ApiProperty({ description: '이전 페이지 URL', required: false })
    prevPageUrl: string | null;
  
    @ApiProperty({ description: '조회된 상품의 총 개수', example: 10 })
    count: number;
  
  }