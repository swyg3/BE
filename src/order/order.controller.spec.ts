import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderCommand } from './commands/create-order.command';
import { CreateOrderDto } from './dtos/create-order.dto';
import { OrderController } from './order.controller';

describe('OrderController', () => {
  let controller: OrderController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() }, // CommandBus 모의 객체 생성
        },
        {
          provide: QueryBus,
          useValue: {}, // 필요에 따라 추가
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should execute CreateOrderCommand', async () => {
      const createOrderDto: CreateOrderDto = {
        userId: 1,
        totalAmount: 100,
        totalPrice: 100,
        pickupTime: new Date(),
        paymentMethod: 'CASH',
        status: 'PENDING',
        items: [],
      };

      const command = new CreateOrderCommand(
        createOrderDto.userId,
        createOrderDto.totalAmount,
        createOrderDto.totalPrice,
        createOrderDto.pickupTime,
        createOrderDto.paymentMethod,
        createOrderDto.status,
        createOrderDto.items
      );

      jest.spyOn(commandBus, 'execute').mockResolvedValue('result'); // CommandBus의 execute 메서드 모의

      const result = await controller.createOrder(createOrderDto);
      expect(result).toBe('result');
      expect(commandBus.execute).toHaveBeenCalledWith(command);
    });
  });
});
