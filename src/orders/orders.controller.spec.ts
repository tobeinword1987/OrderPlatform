import { Mocked, TestBed } from '@suites/unit';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { OrderDB } from './orders.repo';
import { AuditLog } from 'src/auditLogs/auditLog.entity';

describe('OrdersService', () => {
  let ordersService: OrdersService;
  let orderDB: Mocked<OrderDB>;
  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(OrdersService).compile();
    ordersService = unit; // the real class under test
    orderDB = unitRef.get(OrderDB); // auto-mocked dependency
  });
  it('should create order', async () => {
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

    const auditContext = {
      correlationId: '123',
      actorId: '456',
    } as AuditLog;

    orderDB.createOrder.mockResolvedValue(order);
    const result = await ordersService.createOrder(newOrderReq, auditContext);
    expect(result).toEqual(order);
  });
});
