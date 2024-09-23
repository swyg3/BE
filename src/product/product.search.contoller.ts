import { Controller, Get, Post, Query } from '@nestjs/common';
import { ElasticService } from 'src/elastic/elastic.service';

@Controller('search')
export class ProductSearchController {
    constructor(
        private readonly elasticService: ElasticService
    ) { }
    
        @Get('search')
        async searchProducts(@Query('content') query: string) {
          return this.elasticService.searchProducts(query);
        }
      
        @Post('index')
        async indexProducts() {
          return this.elasticService.indexProductsFromDynamoDB();
        }
    }



