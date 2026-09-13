import axios from "axios";
import { performance } from "perf_hooks";

const BASE_URL = "http://localhost:5000";
const API_KEY = "sk_demo_eventengine_7c4f92b18e5d";

const TESTS = [
  { events: 100, concurrency: 10 },
  { events: 500, concurrency: 50 },
  { events: 1000, concurrency: 100 }
];

function createEvent(index) {
  return {
    type: "USER_SIGNUP",

    payload: {
      userId: `user_${index}`,
      email: `user${index}@example.com`
    },

    idempotencyKey: `benchmark-${Date.now()}-${index}`
  };
}

function percentile(values, p) {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);

  const index = Math.ceil((p / 100) * sorted.length) - 1;

  return sorted[Math.max(index, 0)];
}

function average(values) {
  if (values.length === 0) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

async function runBenchmark(totalEvents, concurrency) {

  console.log("\n========================================");
  console.log(`Events: ${totalEvents}`);
  console.log(`Concurrency: ${concurrency}`);
  console.log("========================================");

  const latencies = [];
  let successful = 0;
  let failed = 0;

  const events = Array.from(
    { length: totalEvents },
    (_, index) => createEvent(index + 1)
  );

  const benchmarkStart = performance.now();

  let nextIndex = 0;

  async function worker() {

    while (true) {

      const index = nextIndex++;

      if (index >= events.length) {
        return;
      }

      const event = events[index];

      const start = performance.now();

      try {

        const response = await axios.post(
          `${BASE_URL}/api/events`,
          event,
          {
            headers: {
              "x-api-key": API_KEY,
              "Content-Type": "application/json"
            },

            validateStatus: () => true
          }
        );

        const end = performance.now();

        const latency = end - start;

        latencies.push(latency);

        if (response.status >= 200 && response.status < 300) {
          successful++;
        } else {
          failed++;

          console.log(
            `Request ${index + 1} failed:`,
            response.status,
            response.data
          );
        }

      } catch (error) {

        const end = performance.now();

        latencies.push(end - start);

        failed++;

        console.log(
          `Request ${index + 1} error:`,
          error.message
        );
      }
    }
  }

  const workers = [];

  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  const benchmarkEnd = performance.now();

  const durationSeconds =
    (benchmarkEnd - benchmarkStart) / 1000;

  const avgLatency = average(latencies);
  const p50 = percentile(latencies, 50);
  const p95 = percentile(latencies, 95);
  const p99 = percentile(latencies, 99);
  const maxLatency =
    latencies.length > 0
      ? Math.max(...latencies)
      : 0;

  const throughput =
    durationSeconds > 0
      ? totalEvents / durationSeconds
      : 0;

  const failureRate =
    totalEvents > 0
      ? (failed / totalEvents) * 100
      : 0;

  console.log("\nRESULT");
  console.log("----------------------------------------");

  console.log(`Total requests : ${totalEvents}`);
  console.log(`Successful     : ${successful}`);
  console.log(`Failed         : ${failed}`);
  console.log(`Failure rate   : ${failureRate.toFixed(2)}%`);

  console.log(`Average latency: ${avgLatency.toFixed(2)} ms`);
  console.log(`P50 latency    : ${p50.toFixed(2)} ms`);
  console.log(`P95 latency    : ${p95.toFixed(2)} ms`);
  console.log(`P99 latency    : ${p99.toFixed(2)} ms`);
  console.log(`Max latency    : ${maxLatency.toFixed(2)} ms`);

  console.log(`Duration       : ${durationSeconds.toFixed(2)} sec`);
  console.log(`Throughput     : ${throughput.toFixed(2)} req/sec`);

  return {
    totalEvents,
    concurrency,
    successful,
    failed,
    failureRate,
    averageLatency: avgLatency,
    p50,
    p95,
    p99,
    maxLatency,
    durationSeconds,
    throughput
  };
}

async function main() {

  console.log("EVENT ENGINE BASELINE BENCHMARK");

  const results = [];

  for (const test of TESTS) {

    const result = await runBenchmark(
      test.events,
      test.concurrency
    );

    results.push(result);

    // Small pause between benchmark runs
    await new Promise(resolve =>
      setTimeout(resolve, 3000)
    );
  }

  console.log("\n\n========================================");
  console.log("FINAL BENCHMARK SUMMARY");
  console.log("========================================");

  console.table(results);
}

main().catch(error => {

  console.error("\nBenchmark failed:");
  console.error(error);

  process.exit(1);
});