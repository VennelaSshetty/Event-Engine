import Event from "../src/models/Event.js";
import { processDLQJob } from "../src/services/dlqService.js";

describe("Dead Letter Queue", () => {

  test("should mark an event as DLQ", async () => {

    // Create a fake failed event
    const event = await Event.create({
      type: "USER_SIGNUP",
      payload: {
        userId: "user_101",
        email: "user@test.com"
      },
      idempotencyKey: "dlq_test_001",
      appName: "TestApp",
      status: "processing",
      startedAt: new Date(Date.now() - 5000),
      correlationId: "corr-test-123"
    });

    // Simulate a DLQ job
    await processDLQJob({
      eventId: event._id,
      retryCount: 5,
      error: "Server Down",
      failedAt: new Date()
    });

    // Read updated event
    const updated = await Event.findById(event._id);

    expect(updated.status).toBe("failed");
    expect(updated.retryCount).toBe(5);

    expect(updated.isInDLQ).toBe(true);

    expect(updated.dlqReason)
      .toBe("Server Down");

    expect(updated.movedToDLQAt)
      .not.toBeNull();

    expect(updated.processingTimeMs)
      .toBeGreaterThan(0);

  });

});