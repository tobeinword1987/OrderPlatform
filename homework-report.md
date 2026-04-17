#Homework #21
# Performance Optimization Report

1. Hot scenario: curl --location 'http://localhost:3000/graphql'

Order filtered graphQl request, at code there is a method ordersFiltered in OrdersService class.

2. Tere, to list filtered orders from DB, for calculating number of pages and count of pages, I did request to the DB twice. You can see changes in my PR. 

Was: const allFilteredOrders = await ordersSortedQb.getMany();
Now: const allFilteredOrders = await ordersSortedQb.getCount();

This request was unnecessary.

During tests I measured performance metrics: 

Duration of request:  64.55029099999228 ms
CPU usage user:  73190 µs
CPU usage system:  9033 ms
Memory usage:  9981232 bytes
Memory usage total:  9936896 bytes

Also I tested this endpoint with autocannon tool, with the one time load of 10 connections, and the measurements showed that during 10 seconds there were executed only ~ 330 requests. It's too small.

3. I used Math.round to round number of pages. I changed it to the Math.ceil. It rounds to the biggest integer, so it lets me to make less requests to the DB, to list all orders.

4. The next improvement: I added one more index on table Order:
@Index('Index_created_at_order_status', ['createdAt', 'orderStatus'], { unique: false })

It improve cost/runtime, because the search in DB becomes faster, for we are searching where cretaed_at and order_status condition.

5. Evidences. All measurements and metrics are in the next files:

 - ./performance-finops-evidence/performance_tests_before.txt;
 - ./performance-finops-evidence/performance_tests_after.txt;
 - ./performance-finops-evidence/autocannon_tests_before.txt;
 - ./performance-finops-evidence/autocannon_tests_after.txt;

All final results are gathered in final table: ./performance-finops-evidence/result_table.txt;

6. Both improvements improved both conditions:
 - performance (requests are impressionaly faster now);
 - cost/runtime. Low requests required more replicas of service. Fast requests allow to provide fast service to the large number of customers.

7. From metrics I see that now I more CPU memory is needed. So it can be the bottleneck in the future, and, maybe I will need to provide more CPU. I have to control this value with some dashboards (Grafana).