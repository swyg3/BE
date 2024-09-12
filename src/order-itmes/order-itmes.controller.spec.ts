import { Test, TestingModule } from '@nestjs/testing';
import { OrderItmesController } from './order-itmes.controller';

describe('OrderItmesController', () => {
  let controller: OrderItmesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderItmesController],
    }).compile();

    controller = module.get<OrderItmesController>(OrderItmesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
