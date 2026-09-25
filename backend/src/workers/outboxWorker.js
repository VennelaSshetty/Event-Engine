import OutboxEvent from "../models/OutboxEvent.js";
import eventQueue from "../queues/queue.js";
import mongoose from "mongoose";
import logger from "../utils/logger.js";
import config from "../config/env.js";

await mongoose.connect(config.mongoUri);

logger.info({
  service: "outbox-worker",
  message: "Outbox Worker connected to MongoDB"
});

const BATCH_SIZE = 100;

let shutdownRequested = false;
let processing = false;

/**
 * Process pending outbox events
 */
const processOutbox = async () => {
  processing = true;

  let eventIds = [];
  try {
// -----------------------------------
// FETCH PENDING EVENTS
// -----------------------------------

const pendingEvents = await OutboxEvent.find({
  status: "PENDING"
})
.sort({ createdAt: 1 })
.limit(BATCH_SIZE)
.lean();

if (pendingEvents.length === 0) return;

// -----------------------------------
// MARK AS PROCESSING IMMEDIATELY
// -----------------------------------

eventIds = pendingEvents.map(event => event._id);

await OutboxEvent.updateMany(
  {
    _id: { $in: eventIds },
    status: "PENDING"
  },
  {
    $set: {
      status: "PROCESSING"
    }
  }
);

// -----------------------------------
// FETCH ONLY LOCKED EVENTS
// -----------------------------------

const events = await OutboxEvent.find({
  _id: { $in: eventIds },
  status: "PROCESSING"
}).lean();

    if (events.length === 0) return;

    logger.info({
      service: "outbox-worker",
      batchSize: events.length,
      message: "Processing outbox batch"
    });

// -----------------------------------
// PREPARE BATCH EVENTS
// -----------------------------------

const batchEvents = events.map(event => {

  logger.info({
    service: "outbox-worker",
    correlationId: event.correlationId,
    eventId: event.eventId,
    message: "Preparing event for batch queue"
  });

  return {
    eventId: event.eventId.toString(),
    correlationId: event.correlationId
  };
});

// -----------------------------------
// PUSH ENTIRE BATCH TO QUEUE
// -----------------------------------
if (batchEvents.length > 0) {

  // -----------------------------------
  // PUSH ENTIRE BATCH TO QUEUE
  // -----------------------------------

  try {

   await eventQueue.add(
  "process-batch",
  { events: batchEvents }
);

  } catch (err) {

    // -----------------------------------
    // RESET TO PENDING ONLY IF
    // QUEUE PUSH FAILED
    // -----------------------------------

    await OutboxEvent.updateMany(
      {
        _id: { $in: eventIds }
      },
      {
        $set: {
          status: "PENDING"
        }
      }
    );

    throw err;
  }

  logger.info({
    service: "outbox-worker",
    batchSize: batchEvents.length,
    message: "Batch pushed to queue successfully"
  });

  // -----------------------------------
  // MARK EVENTS AS SENT
  // -----------------------------------

  await OutboxEvent.updateMany(
    {
      _id: {
        $in: events.map(e => e._id)
      }
    },
    {
      $set: {
        status: "SENT",
        processedAt: new Date()
      }
    }
  );

  logger.info({
    service: "outbox-worker",
    updatedCount: events.length,
    message: "Batch events marked as SENT"
  });
}

   } catch (err) {
    logger.error({
      service: "outbox-worker",
      error: err.message,
      message: "Outbox processing failed"
    });
  } finally {
    processing = false;
  }
};

/**
 * Start worker loop
 */
const startOutboxWorker = async () => {
  logger.info({
    service: "outbox-worker",
    interval: "5 seconds",
    message: "Outbox Worker started"
  });

while (!shutdownRequested) {

  await processOutbox();

  if (shutdownRequested) {
    break;
  }

  await new Promise(resolve =>
    setTimeout(resolve, 5000)
  );
}
};

export default startOutboxWorker;

const shutdown = async (signal) => {
  logger.info({
    service: "outbox-worker",
    signal,
    message: "Graceful shutdown initiated"
  });

  shutdownRequested = true;

  try {
    // Wait for the current outbox operation to finish.
    while (processing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await mongoose.connection.close();

    logger.info({
      service: "outbox-worker",
      message: "MongoDB connection closed"
    });

    logger.info({
      service: "outbox-worker",
      message: "Graceful shutdown completed"
    });

    process.exit(0);

  } catch (err) {
    logger.error({
      service: "outbox-worker",
      error: err.message,
      message: "Graceful shutdown failed"
    });

    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));



startOutboxWorker();