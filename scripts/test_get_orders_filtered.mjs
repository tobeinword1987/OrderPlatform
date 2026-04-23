'use strict'

import autocannon, { printResult } from 'autocannon';
import fs from 'fs';

//todo why it doesn't understand that autocannon is an object

console.log(process.env.BASE_URL);

let response;
const baseUrl = 'http://localhost:3000'

export const testUserDB = {
 username: 'login1',
 password: 'password1',
};

const graphqlBody = JSON.stringify({
  query: "query ordersFiltered($filter: OrdersFilterInput!, $ordersPaginationInput: OrdersPaginationInput!)\n{\n    ordersFiltered( filter: $filter, ordersPaginationInput: $ordersPaginationInput )\n        {\n            orders {\n                id\n                idempotency_key\n                user_id\n                delivery_address\n                order_status\n                created_at\n                updated_at\n                \n                orderItems {\n                    id\n                    price_at_purchase\n                    quantity\n                    product_id\n                    product {\n                        id\n                        category_id\n                        name\n                        quantity\n                    }\n                }\n        }\n        cursor {\n            createdAt\n            idTieBreaker\n        }\n        countOfPages\n    }\n}",
  variables: {"filter":{"status":"CREATED"},"ordersPaginationInput":{"limit":2,"createdAt":"2026-04-13T19:28:24.569Z","idTieBreaker":"fd00eef5-98e7-4124-b6d6-d9483dd3253c"}}
})
response = await fetch(`${baseUrl}/auth/login`, {
 method: 'POST',
 headers: {
  'Content-type': 'application/json',
 },
 body: JSON.stringify(testUserDB),
});
const userData = await response.json();
console.log(userData);

const foo = async () => {
 console.log(typeof autocannon);
 const result = await autocannon({
  url: `${baseUrl}/graphql`,
  method: 'POST',
  connections: 10, //default
  pipelining: 1, // default
  duration: 10, // default
  body: graphqlBody,
  headers:{
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${userData.accessToken}`
  }
 })
 return result;
}

try {
  const data = autocannon.printResult(await foo());
  console.log(data);
  fs.writeFile("./performance-finops-evidence/autocannon_tests", data, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});
} catch (error) {
  console.error(error);
}