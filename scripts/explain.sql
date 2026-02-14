EXPLAIN (ANALYZE, BUFFERS)
SELECT o.id,
       o.user_id,
       o.created_at,
       oi.product_id,
       oi.quantity
FROM public."order" as o
LEFT JOIN public."order_item" as oi ON oi.order_id = o.id
WHERE true
	AND o.user_id = '0c6af838-fad5-4f6f-909d-d74886b1d5a2'
  AND o.created_at >= '2026-02-12'
  AND o.created_at <= '2026-02-16'
ORDER BY o.created_at ASC

1. Without @Index('Index_order_user_id', ['userId'])

2.   Without @Index('Index_order_created_at', ['createdAt'])

"Sort  (cost=25168.50..25434.48 rows=106391 width=60) (actual time=92.901..97.679 rows=108165.00 loops=1)"
"  Sort Key: o.created_at"
"  Sort Method: external merge  Disk: 7384kB"
"  Buffers: shared hit=5873, temp read=923 written=925"
"  ->  Hash Right Join  (cost=4584.14..12284.87 rows=106391 width=60) (actual time=24.335..74.747 rows=108165.00 loops=1)"
"        Hash Cond: (oi.order_id = o.id)"
"        Buffers: shared hit=5873"
"        ->  Seq Scan on order_item oi  (cost=0.00..6858.06 rows=321006 width=36) (actual time=0.014..11.132 rows=321006.00 loops=1)"
"              Buffers: shared hit=3648"
"        ->  Hash  (cost=4132.55..4132.55 rows=36127 width=40) (actual time=24.293..24.293 rows=35988.00 loops=1)"
"              Buckets: 65536  Batches: 1  Memory Usage: 3043kB"
"              Buffers: shared hit=2225"
"              ->  Seq Scan on ""order"" o  (cost=0.00..4132.55 rows=36127 width=40) (actual time=0.030..16.833 rows=35988.00 loops=1)"
"                    Filter: ((created_at >= '2026-02-12 00:00:00+01'::timestamp with time zone) AND (created_at <= '2026-02-16 00:00:00+01'::timestamp with time zone) AND (user_id = '0c6af838-fad5-4f6f-909d-d74886b1d5a2'::uuid))"
"                    Rows Removed by Filter: 73015"
"                    Buffers: shared hit=2225"
"Planning:"
"  Buffers: shared hit=16"
"Planning Time: 0.530 ms"
"Execution Time: 101.343 ms"

2. With @Index('Index_order_user_id', ['userId']) and @Index('Index_order_created_at', ['createdAt'])


"Sort  (cost=24301.45..24567.42 rows=106391 width=60) (actual time=80.585..85.066 rows=108165.00 loops=1)"
"  Sort Key: o.created_at"
"  Sort Method: external merge  Disk: 7384kB"
"  Buffers: shared hit=3 read=5905, temp read=923 written=925"
"  ->  Hash Right Join  (cost=3717.09..11417.82 rows=106391 width=60) (actual time=13.604..61.500 rows=108165.00 loops=1)"
"        Hash Cond: (oi.order_id = o.id)"
"        Buffers: shared read=5905"
"        ->  Seq Scan on order_item oi  (cost=0.00..6858.06 rows=321006 width=36) (actual time=0.302..14.258 rows=321006.00 loops=1)"
"              Buffers: shared read=3648"
"        ->  Hash  (cost=3265.50..3265.50 rows=36127 width=40) (actual time=13.254..13.255 rows=35988.00 loops=1)"
"              Buckets: 65536  Batches: 1  Memory Usage: 3043kB"
"              Buffers: shared read=2257"
"              ->  Bitmap Heap Scan on ""order"" o  (cost=408.28..3265.50 rows=36127 width=40) (actual time=1.091..9.449 rows=35988.00 loops=1)"
"                    Recheck Cond: (user_id = '0c6af838-fad5-4f6f-909d-d74886b1d5a2'::uuid)"
"                    Filter: ((created_at >= '2026-02-12 00:00:00+01'::timestamp with time zone) AND (created_at <= '2026-02-16 00:00:00+01'::timestamp with time zone))"
"                    Heap Blocks: exact=2225"
"                    Buffers: shared read=2257"
"                    ->  Bitmap Index Scan on ""Index_order_user_id""  (cost=0.00..399.25 rows=36127 width=0) (actual time=0.686..0.686 rows=35988.00 loops=1)"
"                          Index Cond: (user_id = '0c6af838-fad5-4f6f-909d-d74886b1d5a2'::uuid)"
"                          Index Searches: 1"
"                          Buffers: shared read=32"
"Planning:"
"  Buffers: shared hit=252 read=30"
"Planning Time: 2.058 ms"
"Execution Time: 88.166 ms"
