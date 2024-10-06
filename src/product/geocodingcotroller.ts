import { Controller, Get, Param, Query } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GeocodingService } from "./geocodingservice";
import { GeocodingResponse } from "./response/geocodingresponse";


@Controller('geocode')
export class GeocodingController {
    constructor(
        private readonly geocodingService: GeocodingService,
        private readonly queryBus: QueryBus,
      ) { }
   

      @Get()
      async getGeocode(@Query('query') query: string): Promise<GeocodingResponse> {
          return this.geocodingService.getGeocode(query);
      }

      //위치동의시 api 
      //가까운상품을 나열하는 api
      //요구사항? request(user의 위도경도) 프론트 제공
      //거쳐야하는 과정?
      //1. seller 의 x,y와 계산하여 응닶값을 기반으로 가게 나열하여 7개 슬라이스 (1차 정렬)
      //2. 가게의 sellerid로 product 찾기 (제일 최신 1개)=> product.expireDate로 (2차 정렬)[0] 뽑기 
      //    # 잠깐 한가게당 상품 노출 개수를 1개로 정해야하지 아늘까?
      //    # 현실적으로 2차정렬은 빼고 그냥 상단 아무거나 가져오는게 나을듯
      //3.  뽑은것들을 합치기
      //     
      //응답사항? response(뽑은것들을 합쳐서 뷰로 반환)
  }
