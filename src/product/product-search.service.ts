import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ElasticService } from '../elastic/elastic.service';
import { DyProductView } from './repositories/dy-product-view.repository';

@Injectable()
export class ProductSearchService {
  constructor(
    private readonly elasticService: ElasticService,
    @InjectModel('DyProductView') private readonly productViewModel: Model<DyProductView>
  ) {}

  async indexProducts() {
    const products = await this.productViewModel.find().exec();
    return this.elasticService.indexProductsFromDynamoDB();
  }

  async searchProducts(query: string) {
    return this.elasticService.searchProducts(query);
  }
}