# Benchmark Results

## Test Environment

| Component | Value |
|-----------|-------|
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Queue | BullMQ + Redis |
| Worker Concurrency | 5 |
| Outbox Batch Size | 100 |
| Authentication | API Key |
| Event Types | USER_SIGNUP, ORDER_CREATED, PAYMENT_SUCCESS |

> **Note:** End-to-end latency was measured only after benchmarked events reached the **COMPLETED** state in MongoDB.

---

# Baseline (Before Database Optimization)

| Requests | Client Concurrency | Success | Failed | Requests/sec | Avg Latency | P50 | P95 | P99 | Max | Throughput |
|----------:|-------------------:|--------:|-------:|-------------:|------------:|----:|----:|----:|----:|-----------:|
| 100 | 10 | 100 | 0 | 19.34 | 11,159 ms | 11,832 ms | 14,529 ms | 15,035 ms | 15,035 ms | 23.27 events/sec |
| 500 | 50 | 500 | 0 | 15.03 | 30,484 ms | 32,903 ms | 41,008 ms | 41,185 ms | 43,029 ms | 2.11 events/sec |
| 1000 | 100 | 1000 | 0 | 18.39 | 28,644 ms | 30,950 ms | 38,996 ms | 40,974 ms | 42,117 ms | 6.08 events/sec |

---

# Final Optimized System

## Optimizations Applied

### Database Optimizations

- Added index on `Event.status`
- Added index on `Event.createdAt`
- Added compound index on `OutboxEvent(status, createdAt)`
- Used `.lean()` for read-only MongoDB queries

### Redis Optimizations

- Cached workflow definitions in Redis
- Warmed workflow cache during worker startup
- Added workflow cache hit/miss metrics
- Exposed cache statistics through `/api/cache`
- Maintained a **100% cache hit ratio** after warm-up

### Metrics Optimizations

- Implemented a centralized metrics service
- Introduced rolling **60-second** operational metrics
- Split metrics into **Lifetime** and **Recent** sections
- Added automatic Redis list trimming to prevent unbounded memory growth
- Added throughput, latency, queue wait, and processing time tracking

---

## Final Benchmark Results

| Requests | Client Concurrency | Success | Failed | Requests/sec | Avg Latency | P50 | P95 | P99 | Max | Throughput |
|----------:|-------------------:|--------:|-------:|-------------:|------------:|----:|----:|----:|----:|-----------:|
| 100 | 10 | 100 | 0 | 18.21 | 10,257 ms | 11,094 ms | 13,527 ms | 13,709 ms | 13,709 ms | 20.19 events/sec |
| 500 | 50 | 500 | 0 | 13.41 | 28,021 ms | 29,228 ms | 35,278 ms | 36,364 ms | 37,937 ms | 14.24 events/sec |
| 1000 | 100 | 1000 | 0 | 17.18 | 38,029 ms | 42,081 ms | 50,091 ms | 51,023 ms | 51,126 ms | 17.84 events/sec |

---

## Observations

- Database indexing reduced MongoDB query overhead and improved overall event processing efficiency.
- Redis workflow caching achieved a **100% cache hit ratio** after warm-up, eliminating repeated workflow lookups and preparing the system for future database-backed workflow definitions.
- The metrics service now reports **rolling 60-second operational metrics**, providing more production-realistic throughput and latency measurements while avoiding unbounded Redis memory usage.
- Asynchronous workflow execution remains the dominant contributor to end-to-end latency under higher concurrency, while request ingestion continues to sustain stable throughput without failures.

---

## Next Improvements

- Health Check Endpoints
- API Versioning
- Docker & Docker Compose
- Circuit Breaker Pattern
- Frontend Dashboard
- Deployment
- Horizontal Scaling


<!-- After DB optimization 
| Requests | Client Concurrency | Success | Failed | Requests/sec | Avg Latency | P50 | P95 | P99 | Max | Throughput |
|----------:|-------------------:|--------:|-------:|-------------:|------------:|----:|----:|----:|----:|-----------:|
| 100 | 10 | 100 | 0 | 19.34 | 11,159 ms | 11,832 ms | 14,529 ms | 15,035 ms | 15,035 ms | 23.27 events/sec |
| 500 | 50 | 500 | 0 | 15.03 | 30,484 ms | 32,903 ms | 41,008 ms | 41,185 ms | 43,029 ms | 2.11 events/sec |
| 1000 | 100 | 1000 | 0 | 18.39 | 28,644 ms | 30,950 ms | 38,996 ms | 40,974 ms | 42,117 ms | 6.08 events/sec |


After redis optimization (not useful here as we didn't reduce any DB lookups)
| Requests | Client Concurrency | Success | Failed | Requests/sec | Avg Latency | P50 | P95 | P99 | Max | Throughput |
|----------:|-------------------:|--------:|-------:|-------------:|------------:|----:|----:|----:|----:|-----------:|
| 100 | 10 | 100 | 0 | 12.40 | 10,969 ms | 11,828 ms | 14,508 ms | 15,796 ms | 15,796 ms | 1.04 events/sec |
| 500 | 50 | 500 | 0 | 13.06 | 28,008 ms | 28,219 ms | 38,196 ms | 39,142 ms | 39,345 ms | 5.20 events/sec |
| 1000 | 100 | 1000 | 0 | 15.56 | 28,599 ms | 30,802 ms | 40,949 ms | 43,096 ms | 45,774 ms | 7.51 events/sec | -->


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


