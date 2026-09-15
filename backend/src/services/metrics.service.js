import Event from "../models/Event.js";

function percentile(values, percentile) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);

  const index =
    Math.ceil((percentile / 100) * sorted.length) - 1;

  return sorted[Math.max(index, 0)];
}

export const getMetricsSummary = async () => {
  // --------------------------------------------------
  // GLOBAL EVENT COUNTS
  // These are calculated across ALL events.
  // --------------------------------------------------

  const [
    totalEvents,
    successfulEvents,
    failedEvents
  ] = await Promise.all([
    Event.countDocuments(),

    Event.countDocuments({
      status: "completed"
    }),

    Event.countDocuments({
      status: "failed"
    })
  ]);

  const failureRate =
    totalEvents > 0
      ? (failedEvents / totalEvents) * 100
      : 0;

  // --------------------------------------------------
  // PERFORMANCE METRICS
  // Only the latest 100 completed/failed events
  // with a recorded processingTimeMs are considered.
  // --------------------------------------------------

  const recentEvents = await Event.find({
    processingTimeMs: {
      $ne: null
    }
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .select("processingTimeMs createdAt completedAt failedAt")
    .lean();

  const latencies = recentEvents
    .map((event) => event.processingTimeMs)
    .filter(
      (latency) =>
        typeof latency === "number" &&
        latency >= 0
    );

  let averageLatency = 0;
  let p50Latency = 0;
  let p95Latency = 0;
  let p99Latency = 0;
  let maxLatency = 0;
  let throughput = 0;

  if (latencies.length > 0) {
    // Average latency
    averageLatency =
      latencies.reduce(
        (sum, latency) => sum + latency,
        0
      ) / latencies.length;

    // Percentiles
    p50Latency = percentile(latencies, 50);
    p95Latency = percentile(latencies, 95);
    p99Latency = percentile(latencies, 99);

    // Maximum latency
    maxLatency = Math.max(...latencies);

    // --------------------------------------------------
    // THROUGHPUT
    //
    // Based only on the same latest events used for
    // performance metrics.
    //
    // We use the time span between the newest and
    // oldest processed event.
    // --------------------------------------------------

    if (recentEvents.length > 1) {
      const newestEvent = recentEvents[0];
      const oldestEvent =
        recentEvents[recentEvents.length - 1];

      const newestTime = new Date(
        newestEvent.completedAt ||
        newestEvent.failedAt ||
        newestEvent.createdAt
      ).getTime();

      const oldestTime = new Date(
        oldestEvent.completedAt ||
        oldestEvent.failedAt ||
        oldestEvent.createdAt
      ).getTime();

      const durationSeconds =
        (newestTime - oldestTime) / 1000;

      if (durationSeconds > 0) {
        throughput =
          recentEvents.length / durationSeconds;
      }
    }
  }

  return {
    totalEvents,
    successfulEvents,
    failedEvents,
    failureRate: Number(failureRate.toFixed(2)),

    averageLatency: Number(
      averageLatency.toFixed(2)
    ),

    p50Latency: Number(
      p50Latency.toFixed(2)
    ),

    p95Latency: Number(
      p95Latency.toFixed(2)
    ),

    p99Latency: Number(
      p99Latency.toFixed(2)
    ),

    maxLatency: Number(
      maxLatency.toFixed(2)
    ),

    throughput: Number(
      throughput.toFixed(2)
    )
  };
};