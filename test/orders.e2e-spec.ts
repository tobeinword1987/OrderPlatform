import { UUID } from 'crypto';
import { testUserDB, newOrderDB } from './test_constants';

const url = process.env['INTEGRATION_TESTS_URL'] || 'http://localhost:3000'
const graphqlUrl = `${url}/graphql`;
enum ORDER_STATUS {
  CREATED = 'created',
  PROCEED = 'PROCEED',
  PAYED = 'PAYED',
}

describe('Orders (e2e)', () => {
  it('should run through all business contour and change order statuses correctly', async () => {
    let response;

    response = await fetch(`${url}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(testUserDB),
    });
    const userData = await response.json();

    const orderFromRes = {
      id: expect.any(String),
      idempotencyKey: newOrderDB.idempotencyKey,
      deliveryAddress: newOrderDB.deliveryAddress,
      orderStatus: expect.any(String),
      userId: newOrderDB.userId,
      totalPriceAtPurchase: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    };

    response = await fetch(`${url}/orders`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${userData.accessToken}`,
      },
      body: JSON.stringify(newOrderDB),
    });

    const orderCreated = await response.json();

    expect(orderCreated.orderStatus).toEqual(ORDER_STATUS.CREATED);

    await new Promise(r => setTimeout(r, 3000));

    let orderById = await getOrderById(orderCreated.id, userData.accessToken);

    expect(orderById.order_status).toEqual(ORDER_STATUS.PROCEED)

    //authorize payments
    response = await fetch(`${url}/orders/authorize`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${userData.accessToken}`,
      },
      body: JSON.stringify({
        orderId: orderCreated.id
      }),
    });

    //get orderById
    orderById = await getOrderById(orderCreated.id, userData.accessToken);

    expect(orderById.order_status).toEqual(ORDER_STATUS.PAYED)

    // delete order
    response = await fetch(`${url}/orders`, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${userData.accessToken}`,
      },
      body: JSON.stringify({ id: orderCreated.id }),
    });

    const orderData = await response.json();
    expect(response.status).toEqual(200);
  }, 50000);
});

const getOrderById = async (orderId: UUID, accessToken: any) => {

  const query = `
    {
      orderById(id: "${orderId}") {
        id
        idempotency_key
        user_id
        delivery_address
        order_status
        created_at
        updated_at
        user {
          id
          first_name
          last_name
          address
          phone_number
          post_code
        }
        orderItems {
          id
          price_at_purchase
          quantity
          product_id
          product {
            id
            category_id
            name
            quantity
          }
        }
      }
    }`

    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query })
    })

    const json = await response.json();

    return json.data.orderById;
}
