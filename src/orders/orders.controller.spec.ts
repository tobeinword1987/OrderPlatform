import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('OrdersController', () => {
  let orderController: OrdersController;

  const order = {
    id: '582201c8-fcde-428b-bbb4-e656e08bb5a6',
    idempotencyKey: '200011lgglls',
    deliveryAddress: 'New delivery addredd, 3/2, loc. 5',
    orderStatus: 'proceed',
    userId: '0c6af838-fad5-4f6f-909d-d74886b1d5a1',
    totalPriceAtPurchase: 37.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Order;

  const newOrderReq = {
    idempotencyKey: '200011lgglls',
    userId: '0c6af838-fad5-4f6f-909d-d74886b1d5a1',
    deliveryAddress: 'New delivery addredd, 3/2, loc. 5',
    products: [
      {
        productId: '0c6af838-fad5-4f6f-909d-d74886b1d5d9',
        quantity: 1,
      },
      {
        productId: '0c6af838-fad5-4f6f-909d-d74886b1d5d8',
        quantity: 2,
      },
    ],
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            createOrder: jest
              .fn()
              .mockImplementation(() => Promise.resolve(order)),
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOneBy: jest.fn().mockImplementation(() => {
              return 'La la la';
            }),
          },
        },
      ],
    }).compile();

    orderController = moduleRef.get(OrdersController);

    // jest
    //   .spyOn(orderService, 'createOrder')
    //   .mockImplementation(async (newOrderReq) => {
    //     return order;
    //   });
  });

  it('Should call orderService method to create order', async () => {
    const createdOrder = await orderController.createOrder(newOrderReq);
    expect(createdOrder).toBe(order);
  });
});
