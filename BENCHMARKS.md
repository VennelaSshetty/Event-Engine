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