import mongoose from "mongoose";

import Event from "../../models/Event.js";
import WorkflowExecution from "../../models/WorkflowExecution.js";

import eventQueue from "../../queues/queue.js";
import connection from "../../config/redis.js";

import { getMetricsSummary } from "../../services/metrics.service.js";
import { getWorkers } from "../../services/workerRegistry.js";

const CHECK_TIMEOUT_MS = 2000;

const withTimeout = (
  promise,
  timeoutMs = CHECK_TIMEOUT_MS
) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error("Dashboard health check timed out")
          ),
        timeoutMs
      )
    )
  ]);
};

const checkRedis = async () => {
  try {
    await withTimeout(connection.ping());
    return true;
  } catch {
    return false;
  }
};

const checkQueue = async () => {
  try {
    await withTimeout(eventQueue.getJobCounts());
    return true;
  } catch {
    return false;
  }
};

const getDashboardHealth = async () => {
  const [redis, queue] = await Promise.all([
    checkRedis(),
    checkQueue()
  ]);

  return {
    api: true,
    worker: false,
    redis,
    mongodb: mongoose.connection.readyState === 1,
    queue
  };
};

export const getDashboardData = async (req, res) => {
  const [
    metrics,
    queueCounts,
    workers,
    health,
    totalEvents,
    completed,
    processing,
    retrying,
    failed,
    dlq,
recentEvents,
dlqEvents,
recentActivity,
eventTypes
  ] = await Promise.all([
    getMetricsSummary(),

    eventQueue.getJobCounts(
      "waiting",
      "active",
      "delayed",
      "completed",
      "failed"
    ),

    getWorkers(),

    getDashboardHealth(),

    Event.countDocuments(),

    Event.countDocuments({
      status: "completed"
    }),

    Event.countDocuments({
      status: "processing"
    }),

    Event.countDocuments({
      status: "retrying"
    }),

    Event.countDocuments({
      status: "failed"
    }),

    Event.countDocuments({
      isInDLQ: true
    }),

        Event.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
  "_id type status correlationId retryCount replayCount processingTimeMs createdAt startedAt completedAt failedAt isInDLQ dlqReason"
)
      .lean(),

    Event.find({
      isInDLQ: true
    })
      .sort({ movedToDLQAt: -1 })
      .limit(10)
     .select(
  "_id type status correlationId retryCount replayCount processingTimeMs createdAt startedAt completedAt failedAt isInDLQ dlqReason movedToDLQAt"
)
      .lean(),

    WorkflowExecution.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),

    Event.aggregate([
      {
        $group: {
          _id: "$type",
          count: {
            $sum: 1
          }
        }
      }
    ])
  ]);

  const busyWorkers = workers.filter(
    (worker) => worker.status === "busy"
  );

  const idleWorkers = workers.filter(
    (worker) => worker.status === "idle"
  );

  const activeEvents = workers.reduce(
    (total, worker) =>
      total + worker.activeEvents.length,
    0
  );

  const activeActions = workers.reduce(
    (total, worker) =>
      total + worker.activeActions.length,
    0
  );

  const activeJobs = workers.reduce(
    (total, worker) =>
      total + (worker.activeJobs || 0),
    0
  );

  const workerHealthy = workers.length > 0;

  health.worker = workerHealthy;

  /*
   * Pipeline values are real server-side counts.
   *
   * ingest:
   *   Events currently entering/awaiting processing.
   *
   * queue:
   *   BullMQ jobs currently waiting, delayed, or active.
   *
   * worker:
   *   Real active BullMQ jobs.
   *
   * actions:
   *   Real actions currently registered by workers.
   *
   * doneOrDlq:
   *   Events that have reached a terminal state.
   */
  const ingest =
    totalEvents -
    completed -
    failed;

  const queue =
    (queueCounts.waiting || 0) +
    (queueCounts.delayed || 0) +
    (queueCounts.active || 0);

  const doneOrDlq =
    completed +
    dlq;

  const pipeline = {
    ingest: Math.max(0, ingest),
    queue,
    worker: activeJobs,
    actions: activeActions,
    doneOrDlq
  };

  const counts = {
    total: totalEvents,
    completed,
    processing,
    retrying,
    failed,
    dlq
  };

  const workerSummary = {
    total: workers.length,
    busy: busyWorkers.length,
    idle: idleWorkers.length,
    activeJobs,
    activeEvents,
    activeActions,
    instances: workers
  };

  const timeline = recentEvents.map(
    (event) => ({
      time: new Date(
        event.createdAt
      ).toLocaleTimeString(),

      status: event.status
    })
  );

  res.status(200).json({
    success: true,

    metrics,

    counts,

    queue: {
      waiting: queueCounts.waiting || 0,
      active: queueCounts.active || 0,
      delayed: queueCounts.delayed || 0,
      completed: queueCounts.completed || 0,
      failed: queueCounts.failed || 0
    },

    workers: workerSummary,

    health,

    pipeline,

    recentEvents,

    dlqEvents,

    recentActivity,

    eventTypes,

    timeline,

    /*
     * Keep these top-level legacy fields so the
     * existing dashboard is not unnecessarily
     * broken while Stage 10 frontend is built.
     */
    totalEvents,
    completed,
    processing,
    failed,
    avgProcessingTime:
      metrics.averageLatency
  });
};