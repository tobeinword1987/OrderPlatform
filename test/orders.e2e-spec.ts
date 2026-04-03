import { testUserDB, existingOrderDB } from './test_constants';

describe('Orders (e2e)', () => {
  it('should return existing Order', async () => {
    let response;

    response = await fetch('http://app:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(testUserDB),
    });
    const userData = await response.json();
    console.log(userData);

    const orderFromRes = {
      id: expect.any(String),
      idempotencyKey: existingOrderDB.idempotencyKey,
      deliveryAddress: existingOrderDB.deliveryAddress,
      orderStatus: 'proceed',
      userId: existingOrderDB.userId,
      totalPriceAtPurchase: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    };

    response = await fetch('http://app:3000/orders', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${userData.accessToken}`,
      },
      body: JSON.stringify(existingOrderDB),
    });

    const orderData = await response.json();
    expect(orderData).toEqual(orderFromRes);
  });
});
