import mongoose from "mongoose";
import connection from "../../config/redis.js";
import eventQueue from "../../queues/queue.js";

const CHECK_TIMEOUT_MS = 2000;

const withTimeout = (promise, timeoutMs = CHECK_TIMEOUT_MS) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Health check timed out")), timeoutMs)
    )
  ]);
};

const checkMongoDB = () => {
  return mongoose.connection.readyState === 1;
};

const checkRedis = async () => {
  try {
    await withTimeout(connection.ping());
    return true;
  } catch (error) {
    return false;
  }
};

const checkQueue = async () => {
  try {
    await withTimeout(eventQueue.getJobCounts());
    return true;
  } catch (error) {
    return false;
  }
};

const getDependencyChecks = async () => {
  const [redis, queue] = await Promise.all([
    checkRedis(),
    checkQueue()
  ]);

  return {
    mongodb: checkMongoDB(),
    redis,
    queue
  };
};

export const live = async (req, res) => {
  res.status(200).json({
    status: "alive"
  });
};

export const ready = async (req, res) => {
  const checks = await getDependencyChecks();

  const isReady = Object.values(checks).every(Boolean);

  res.status(isReady ? 200 : 503).json({
    status: isReady ? "ready" : "not_ready",
    checks
  });
};

export const health = async (req, res) => {
  const checks = await getDependencyChecks();

  const isHealthy = Object.values(checks).every(Boolean);

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "healthy" : "unhealthy",
    checks
  });
};