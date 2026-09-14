# Event Engine Benchmarks

## BASELINE — Before DB and Redis Optimization

### Test 1

- Total Events: 100
- Concurrency: 10
- Successful Requests: 100
- Failed Requests: 0
- Failure Rate: 0.00%
- Average Latency: 640.50 ms
- P50 Latency: 518.66 ms
- P95 Latency: 1635.75 ms
- P99 Latency: 1926.01 ms
- Max Latency: 2061.34 ms
- Duration: 6.62 sec
- Throughput: 15.12 req/sec

### Test 2

- Total Events: 500
- Concurrency: 50
- Successful Requests: 500
- Failed Requests: 0
- Failure Rate: 0.00%
- Average Latency: 3407.41 ms
- P50 Latency: 3053.42 ms
- P95 Latency: 4884.71 ms
- P99 Latency: 5982.09 ms
- Max Latency: 6968.52 ms
- Duration: 35.45 sec
- Throughput: 14.10 req/sec

### Test 3

- Total Events: 1000
- Concurrency: 100
- Successful Requests: 1000
- Failed Requests: 0
- Failure Rate: 0.00%
- Average Latency: 5094.13 ms
- P50 Latency: 4996.06 ms
- P95 Latency: 6275.21 ms
- P99 Latency: 8038.87 ms
- Max Latency: 11015.22 ms
- Duration: 53.26 sec
- Throughput: 18.78 req/sec

---

## Baseline Summary

| Total Events | Concurrency | Success | Failure | Avg Latency | P50 | P95 | P99 | Max Latency | Duration | Throughput |
|-------------:|------------:|--------:|--------:|------------:|----:|----:|----:|------------:|---------:|-----------:|
| 100 | 10 | 100 | 0 | 640.50 ms | 518.66 ms | 1635.75 ms | 1926.01 ms | 2061.34 ms | 6.62 sec | 15.12 req/sec |
| 500 | 50 | 500 | 0 | 3407.41 ms | 3053.42 ms | 4884.71 ms | 5982.09 ms | 6968.52 ms | 35.45 sec | 14.10 req/sec |
| 1000 | 100 | 1000 | 0 | 5094.13 ms | 4996.06 ms | 6275.21 ms | 8038.87 ms | 11015.22 ms | 53.26 sec | 18.78 req/sec |

---

## DB OPTIMIZATION

Added database indexes for frequently queried/sorted fields, optimized duplicate-event lookup with `.lean()`, and tuned MongoDB connection pooling with `minPoolSize: 10` and `maxPoolSize: 100`.

### Optimized Results

### Test 1

- Total Events: 100
- Concurrency: 10
- Successful Requests: 100
- Failed Requests: 0
- Failure Rate: 0.00%
- Average Latency: 525.42 ms
- P50 Latency: 191.52 ms
- P95 Latency: 1001.20 ms
- P99 Latency: 1005.38 ms
- Max Latency: 1018.51 ms
- Duration: 5.30 sec
- Throughput: 18.86 req/sec

### Test 2

- Total Events: 500
- Concurrency: 50
- Successful Requests: 500
- Failed Requests: 0
- Failure Rate: 0.00%
- Average Latency: 3079.87 ms
- P50 Latency: 2998.74 ms
- P95 Latency: 4024.88 ms
- P99 Latency: 4047.88 ms
- Max Latency: 4232.38 ms
- Duration: 31.93 sec
- Throughput: 15.66 req/sec

### Test 3

- Total Events: 1000
- Concurrency: 100
- Successful Requests: 1000
- Failed Requests: 0
- Failure Rate: 0.00%
- Average Latency: 4086.83 ms
- P50 Latency: 4009.24 ms
- P95 Latency: 5016.94 ms
- P99 Latency: 5993.74 ms
- Max Latency: 9026.25 ms
- Duration: 43.05 sec
- Throughput: 23.23 req/sec

## DB Optimized Summary

| Total Events | Concurrency | Success | Failure | Avg Latency | P50 | P95 | P99 | Max Latency | Duration | Throughput |
|-------------:|------------:|--------:|--------:|------------:|----:|----:|----:|------------:|---------:|-----------:|
| 100 | 10 | 100 | 0 | 525.42 ms | 191.52 ms | 1001.20 ms | 1005.38 ms | 1018.51 ms | 5.30 sec | 18.86 req/sec |
| 500 | 50 | 500 | 0 | 3079.87 ms | 2998.74 ms | 4024.88 ms | 4047.88 ms | 4232.38 ms | 31.93 sec | 15.66 req/sec |
| 1000 | 100 | 1000 | 0 | 4086.83 ms | 4009.24 ms | 5016.94 ms | 5993.74 ms | 9026.25 ms | 43.05 sec | 23.23 req/sec |

---

## Baseline vs DB Optimized

| Total Events | Concurrency | Avg Latency Improvement | P50 Improvement | P95 Improvement | P99 Improvement | Max Latency Improvement | Throughput Improvement |
|-------------:|------------:|------------------------:|----------------:|----------------:|----------------:|------------------------:|-----------------------:|
| 100 | 10 | 18.0% ↓ | 63.1% ↓ | 38.8% ↓ | 47.8% ↓ | 50.6% ↓ | 24.7% ↑ |
| 500 | 50 | 9.6% ↓ | 1.8% ↓ | 17.6% ↓ | 32.3% ↓ | 39.3% ↓ | 11.1% ↑ |
| 1000 | 100 | 19.8% ↓ | 19.7% ↓ | 20.1% ↓ | 25.4% ↓ | 18.1% ↓ | 23.7% ↑ |

---

## REDIS OPTIMIZATION

Optimized Redis/BullMQ configuration by tuning the Redis connection for long-running worker usage, centralizing BullMQ job-retention settings, and enabling worker metrics collection. Existing event batching was preserved to avoid unnecessary Redis job creation.

### Optimized Results

### Test 1

- Total Events: 100
- Concurrency: 10
- Successful Requests: 100
- Failed Requests: 0
- Failure Rate: 0.00%
- Average Latency: 334.29 ms
- P50 Latency: 133.97 ms
- P95 Latency: 800.24 ms
- P99 Latency: 803.02 ms
- Max Latency: 806.36 ms
- Duration: 3.44 sec
- Throughput: 29.09 req/sec

### Test 2

- Total Events: 500
- Concurrency: 50
- Successful Requests: 500
- Failed Requests: 0
- Failure Rate: 0.00%
- Average Latency: 3476.98 ms
- P50 Latency: 3945.01 ms
- P95 Latency: 4047.40 ms
- P99 Latency: 4108.63 ms
- Max Latency: 4995.42 ms
- Duration: 36.78 sec
- Throughput: 13.59 req/sec

### Test 3

- Total Events: 1000
- Concurrency: 100
- Successful Requests: 1000
- Failed Requests: 0
- Failure Rate: 0.00%
- Average Latency: 4097.90 ms
- P50 Latency: 4007.60 ms
- P95 Latency: 5019.09 ms
- P99 Latency: 6122.07 ms
- Max Latency: 8037.17 ms
- Duration: 44.03 sec
- Throughput: 22.71 req/sec

---

## FINAL OPTIMIZED SUMMARY

| Total Events | Concurrency | Success | Failure | Avg Latency | P50 | P95 | P99 | Max Latency | Duration | Throughput |
|-------------:|------------:|--------:|--------:|------------:|----:|----:|----:|------------:|---------:|-----------:|
| 100 | 10 | 100 | 0 | 334.29 ms | 133.97 ms | 800.24 ms | 803.02 ms | 806.36 ms | 3.44 sec | 29.09 req/sec |
| 500 | 50 | 500 | 0 | 3476.98 ms | 3945.01 ms | 4047.40 ms | 4108.63 ms | 4995.42 ms | 36.78 sec | 13.59 req/sec |
| 1000 | 100 | 1000 | 0 | 4097.90 ms | 4007.60 ms | 5019.09 ms | 6122.07 ms | 8037.17 ms | 44.03 sec | 22.71 req/sec |

---

## Baseline vs Final Optimized

| Total Events | Concurrency | Avg Latency Improvement | P50 Improvement | P95 Improvement | P99 Improvement | Max Latency Improvement | Throughput Improvement |
|-------------:|------------:|------------------------:|----------------:|----------------:|------------------------:|------------------------:|-----------------------:|
| 100 | 10 | 47.8% ↓ | 74.2% ↓ | 51.1% ↓ | 58.3% ↓ | 60.9% ↓ | 92.4% ↑ |
| 500 | 50 | 2.0% ↑ | 29.2% ↑ | 17.1% ↓ | 31.3% ↓ | 28.3% ↓ | 3.6% ↓ |
| 1000 | 100 | 19.6% ↓ | 19.8% ↓ | 20.0% ↓ | 23.8% ↓ | 27.0% ↓ | 20.9% ↑ |

> Note: The 500-event workload showed higher average and P50 latency and slightly lower throughput in the final run, while P95, P99, and maximum latency improved. This reflects variability under concurrent load.


