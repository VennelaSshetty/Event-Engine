import redis from "../config/redis.js";
import workflowMap from "../config/workflowMap.js";

const WORKFLOW_TTL = 60 * 60; // 1 hour

const getWorkflowKey = (eventType) => {
  return `workflow:${eventType}`;
};

/**
 * Fetch workflow using CACHE-ASIDE pattern
 */
export async function fetchWorkflow(eventType) {

  const cacheKey = getWorkflowKey(eventType);

  // -----------------------------
  // 1. CHECK REDIS CACHE
  // -----------------------------
  const cachedWorkflow = await redis.get(cacheKey);

  if (cachedWorkflow) {
    return JSON.parse(cachedWorkflow);
  }

  // -----------------------------
  // 2. FALLBACK TO SOURCE OF TRUTH
  // -----------------------------
  const workflow = workflowMap[eventType];

  if (!workflow) {
    return null;
  }

  // -----------------------------
  // 3. STORE IN CACHE
  // -----------------------------
 await redis.set(
  cacheKey,
  JSON.stringify(workflow),
  "EX",
  WORKFLOW_TTL
);

  return workflow;
}

/**
 * Remove workflow from cache
 */
export async function invalidateWorkflow(eventType) {

  const cacheKey = getWorkflowKey(eventType);

  await redis.del(cacheKey);
}

/**
 * Warm all workflows into cache
 */
export async function warmWorkflowCache() {

  const entries = Object.entries(workflowMap);

  for (const [eventType, workflow] of entries) {

    const cacheKey = getWorkflowKey(eventType);

   await redis.set(
  cacheKey,
  JSON.stringify(workflow),
  "EX",
  WORKFLOW_TTL
);
  }
}