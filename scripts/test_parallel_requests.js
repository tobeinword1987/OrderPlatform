
const baseUrl = process.env['BASE_URL'] ?? 'http://localhost:3000'
const numberOfClients = 10;

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
  "idempotencyKey": Math.random().toString().slice(2),
  "userId": "0c6af838-fad5-4f6f-909d-d74886b1d5a1",
  "deliveryAddress": "New delivery addredd, 3/2, loc. 5",
  "products": [
    {
      "productId": "0c6af838-fad5-4f6f-909d-d74886b1d5d9",
      "quantity": 1
    },
    {
      "productId": "0c6af838-fad5-4f6f-909d-d74886b1d5d8",
      "quantity": 2
    }
  ]
});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

const run = async () => {
  const res = await Promise.all(Array.from({ length: numberOfClients }, () => {
    fetch(`${baseUrl}/orders`, requestOptions)
      .then((response) => ({
        status: response.status
      }))
      .then((result) => console.log(result))
      .catch((error) => ({
        status: error.status
      }))
  }))
}

run();
