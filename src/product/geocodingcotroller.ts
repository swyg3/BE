import { Controller, Get, Param, Query } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GeocodingService } from "./geocodingservice";
import { GeocodingResponse } from "./response/geocodingresponse";


@Controller("products")
export class GeocodingController {
    constructor(
        private readonly geocodingService: GeocodingService,
        private readonly queryBus: QueryBus,
      ) { }
   

      @Get("/geocode")
      async getGeocode(@Query('address') address: string): Promise<GeocodingResponse> {
          return this.geocodingService.getGeocode(address);
      }
  }
}