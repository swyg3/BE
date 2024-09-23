import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ElasticService } from './elastic.service';
import { ElasticController } from './elastic.controller';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ProductModule } from 'src/product/product.module';
import { DySearchProductViewSchema } from 'src/product/schemas/dy-product-search-view.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: `http://elasticsearch_dev:${configService.get<string>('ELASTICSEARCH_PORT')}`,
      }),
      inject: [ConfigService],
    }),
    DynamooseModule.forFeature([{ name: 'DySearchProductView', schema: DySearchProductViewSchema }]), 
    forwardRef(() => ProductModule),
  ],
  providers: [ElasticService],
  controllers: [ElasticController],
  exports: [ElasticService],
})
export class ElasticModule {}
