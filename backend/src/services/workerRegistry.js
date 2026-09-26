import crypto from "crypto";
import connection from "../config/redis.js";

const REGISTRY_KEY = "event-engine:workers";
const WORKER_KEY_PREFIX = "event-engine:worker:";
const HEARTBEAT_TTL_MS = 5000;
const HEARTBEAT_INTERVAL_MS = 2000;

const workerId =
  `worker-${process.pid}-${crypto.randomBytes(3).toString("hex")}`;

const workerKey = `${WORKER_KEY_PREFIX}${workerId}`;

let heartbeatTimer = null;

let currentState = {
  status: "starting",
  activeEvents: [],
  activeActions: [],
  activeJobs: 0,
  lastHeartbeat: Date.now()
};

const writeState = async () => {
  currentState.lastHeartbeat = Date.now();

  const payload = JSON.stringify({
    workerId,
    ...currentState
  });

  await connection.set(
    workerKey,
    payload,
    "PX",
    HEARTBEAT_TTL_MS
  );

  await connection.zadd(
    REGISTRY_KEY,
    currentState.lastHeartbeat,
    workerId
  );
};

export const getWorkerId = () => workerId;

export const updateWorkerState = async (patch = {}) => {
  currentState = {
    ...currentState,
    ...patch,
    lastHeartbeat: Date.now()
  };

  try {
    await writeState();
  } catch {
    // Worker observability must never break event processing.
  }
};

export const addActiveEvent = async (event) => {
  const activeEvents = [
    ...currentState.activeEvents,
    {
      eventId: String(event.eventId),
      type: event.type,
      correlationId: event.correlationId
    }
  ].slice(-8);

  await updateWorkerState({
    status: "busy",
    activeEvents
  });
};

export const removeActiveEvent = async (eventId) => {
  const activeEvents =
    currentState.activeEvents.filter(
      (event) => event.eventId !== String(eventId)
    );

  await updateWorkerState({
    activeEvents,
    status:
      activeEvents.length > 0 ||
      currentState.activeActions.length > 0
        ? "busy"
        : "idle"
  });
};

export const addActiveAction = async (action) => {
  const activeActions = [
    ...currentState.activeActions,
    {
      eventId: String(action.eventId),
      action: action.action,
      correlationId: action.correlationId
    }
  ].slice(-16);

  await updateWorkerState({
    status: "busy",
    activeActions
  });
};

export const removeActiveAction = async ({
  eventId,
  action
}) => {
  const activeActions =
    currentState.activeActions.filter(
      (item) =>
        !(
          item.eventId === String(eventId) &&
          item.action === action
        )
    );

  await updateWorkerState({
    activeActions,
    status:
      currentState.activeEvents.length > 0 ||
      activeActions.length > 0
        ? "busy"
        : "idle"
  });
};

export const setActiveJobs = async (activeJobs) => {
  await updateWorkerState({
    activeJobs,
    status:
      activeJobs > 0 ||
      currentState.activeEvents.length > 0 ||
      currentState.activeActions.length > 0
        ? "busy"
        : "idle"
  });
};

export const beginWorkerHeartbeat = async () => {
  if (heartbeatTimer) {
    return;
  }

  await updateWorkerState({
    status: "idle"
  });

  heartbeatTimer = setInterval(() => {
    writeState().catch(() => {});
  }, HEARTBEAT_INTERVAL_MS);
};

export const removeWorker = async () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }

  try {
    await connection.del(workerKey);
    await connection.zrem(
      REGISTRY_KEY,
      workerId
    );
  } catch {
    // Best-effort cleanup.
  }
};

export const getWorkers = async () => {
  const cutoff =
    Date.now() - HEARTBEAT_TTL_MS;

  try {
    await connection.zremrangebyscore(
      REGISTRY_KEY,
      0,
      cutoff
    );

    const workerIds =
      await connection.zrange(
        REGISTRY_KEY,
        0,
        -1
      );

    if (workerIds.length === 0) {
      return [];
    }

    const values = await connection.mget(
      ...workerIds.map(
        (id) =>
          `${WORKER_KEY_PREFIX}${id}`
      )
    );

    return values
      .filter(Boolean)
      .map((value) =>
        JSON.parse(value)
      )
      .sort((a, b) =>
        a.workerId.localeCompare(
          b.workerId
        )
      );
  } catch {
    return [];
  }
};