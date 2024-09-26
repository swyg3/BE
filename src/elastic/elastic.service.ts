import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectModel } from 'nestjs-dynamoose';
import { Model } from 'dynamoose/dist/Model';
import { DySearchProductView } from 'src/product/schemas/dy-product-search-view.schema';

@Injectable()
export class ElasticService {
  private readonly indexName = 'products';

  constructor(
    private readonly esService: ElasticsearchService,
    @InjectModel('DyProductView') private readonly dyProductSearchViewModel: Model<DySearchProductView>
  ) {}

  private async createProductIndexIfNotExists(): Promise<void> {
    const indexExists = await this.esService.indices.exists({ index: this.indexName });
    
    if (!indexExists) {
      await this.esService.indices.create({
        index: this.indexName,
        mappings: {
          properties: {
            productId: { type: 'keyword' },
            name: { type: 'text' },
            description: { type: 'text' },
          }
        }
      });
    }
  }

  async indexProductsFromDynamoDB(): Promise<void> {
    await this.createProductIndexIfNotExists();

    const products = await this.dyProductSearchViewModel.scan().exec();

    const operations = products.flatMap(product => [
      { index: { _index: this.indexName } },
      {
        productId: product.productId,
        name: product.name,
        description: product.description,
      }
    ]);

    if (operations.length > 0) {
      const bulkResponse = await this.esService.bulk({
        operations,
        refresh: true
      });

      if (bulkResponse.errors) {
        const erroredDocuments = [];
        bulkResponse.items.forEach((action, i) => {
          const operation = Object.keys(action)[0];
          if (action[operation].error) {
            erroredDocuments.push({
              status: action[operation].status,
              error: action[operation].error,
              operation: operations[i * 2],
              document: operations[i * 2 + 1]
            });
          }
        });
        console.error('Failed to index documents', erroredDocuments);
      }
    }
  }

  async searchProducts(query: string): Promise<any[]> {
    console.log('Elasticsearch query:', query); // 쿼리 로그 추가
    const searchResponse = await this.esService.search({
      index: this.indexName,
      query: {
        multi_match: {
          query,
          fields: ['name', 'description'],
          fuzziness: 'AUTO', 
        },
      },
    });

    return searchResponse.hits.hits.map(hit => hit._source as any);
  }
}