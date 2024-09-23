import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ElasticService } from '../elastic/elastic.service';
import { ProductView } from './schemas/product-view.schema';

@Injectable()
export class ProductSearchService {
  constructor(
    private readonly elasticService: ElasticService,
    @InjectModel('ProductView') private readonly productViewModel: Model<ProductView>
  ) {}

  async indexProducts() {
    const products = await this.productViewModel.find().exec();
    return this.elasticService.indexProductsFromDynamoDB();
  }

  async searchProducts(query: string) {
    return this.elasticService.searchProducts(query);
  }
}