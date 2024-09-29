import { ConfigService } from '@nestjs/config';
import { DynamooseModuleOptions } from 'nestjs-dynamoose';

export const getDynamoConfig = (configService: ConfigService): DynamooseModuleOptions => {
    const nodeEnv = configService.get('NODE_ENV');
    const isProduction = nodeEnv === 'production';
    
    const baseConfig: DynamooseModuleOptions = {
    aws: {
        accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
        region: configService.get('AWS_REGION'),
    },
};

// 로컬 DynamoDB 연결
  if (!isProduction) {
    const localEndpoint = configService.get('DYNAMODB_ENDPOINT');
    
    return {
      ...baseConfig,
      local: localEndpoint || true,
    };
}

  return baseConfig;
};

export const TableNames = {
    USER_VIEW: 'UserView',
    SELLER_VIEW: 'SellerView',
    PRODUCT_VIEW: 'ProductView',
    ORDER_VIEW: 'OrderView',
    ORDER_ITEMS_VIEW: 'OrderItemsView',
};