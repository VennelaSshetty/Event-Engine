import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import IORedis from "ioredis";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import { EVENT_STATUS } from "../config/eventStatus.js";

// --------------------
// Redis connection
// --------------------
const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null
});

// --------------------
// MongoDB connection
// --------------------
await mongoose.connect(process.env.MONGO_URI);
console.log("Worker connected to MongoDB");

// --------------------
// Worker
// --------------------
const worker = new Worker(
  "event-queue",
  async (job) => {
    console.log("\n==============================");
    console.log("Processing job:", job.id);
    console.log("Type:", job.data.type);

    const { type, payload, eventId } = job.data;

    try {
      // --------------------
      // STEP 1: mark PROCESSING
      // FIXED (no mongoose warning)
      // --------------------
      const processingEvent = await Event.findByIdAndUpdate(
        eventId,
        { status: EVENT_STATUS.PROCESSING },
        { returnDocument: "after" }
      );

      if (!processingEvent) {
        throw new Error("Event not found in DB");
      }

      console.log(`Event ${eventId} → PROCESSING`);

      // --------------------
      // STEP 2: business logic
      // --------------------
      if (!type) {
        throw new Error("Event type missing");
      }

      switch (type) {
        case "ORDER_CREATED":
          console.log("Order Created:", payload);
          break;

        case "PAYMENT_SUCCESS":
          console.log("Payment Success:", payload);
          break;

        case "USER_SIGNUP":
          console.log("User Signup:", payload);
          break;

        default:
          throw new Error(`Unknown event type: ${type}`);
      }

      // --------------------
      // STEP 3: mark COMPLETED
      // --------------------
      await Event.findByIdAndUpdate(
        eventId,
        { status: EVENT_STATUS.COMPLETED }
      );

      console.log(`Event ${eventId} → COMPLETED`);
      console.log("Job SUCCESS:", job.id);

    } catch (err) {
      // --------------------
      // ERROR HANDLING
      // --------------------
      console.error("Worker error:", {
        jobId: job.id,
        eventId,
        message: err.message
      });

      await Event.findByIdAndUpdate(
        eventId,
        { status: EVENT_STATUS.FAILED }
      );

      console.log(`Event ${eventId} → FAILED`);

      throw err;
    }
  },
  { connection }
);

// --------------------
// Worker logs
// --------------------
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job?.id} failed: ${err.message}`);
});