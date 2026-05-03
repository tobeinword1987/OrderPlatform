import { randomUUID } from 'crypto';

export const testUserDB = {
  username: 'login1',
  password: 'password1',
};

export const newOrderDB = {
  idempotencyKey: randomUUID(),
  userId: '0c6af838-fad5-4f6f-909d-d74886b1d5a1',
  deliveryAddress:
    'Ukraine, Cherkasy, Taraask street, building 12, loc. 12, 85-796',
  products: [
    {
      productId: '0c6af838-fad5-4f6f-909d-d74886b1d5d9',
      quantity: 0,
    },
    {
      productId: '0c6af838-fad5-4f6f-909d-d74886b1d5d8',
      quantity: 0,
    },
  ],
};
