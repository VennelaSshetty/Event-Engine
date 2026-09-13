import request from "supertest";

import app from "../app.js";

import ApiKey from "../src/models/ApiKey.js";
import Event from "../src/models/Event.js";
import OutboxEvent from "../src/models/OutboxEvent.js";


describe("Event Idempotency", () => {

  beforeEach(async () => {

    await ApiKey.create({
      key: "test_api_key_123",
      appName: "TestApp",
      isActive: true
    });

  });


  test("duplicate idempotencyKey should return existing event", async () => {


    const payload = {

      type: "USER_SIGNUP",

      payload: {
        userId: "user_123",
        email: "test@gmail.com"
      },

      idempotencyKey: "idem_test_001"

    };


    // First request

    const firstResponse = await request(app)
      .post("/api/events")
      .set(
        "x-api-key",
        "test_api_key_123"
      )
      .send(payload);


    expect(firstResponse.statusCode)
      .toBe(201);



    // Second request with same idempotency key

    const secondResponse = await request(app)
      .post("/api/events")
      .set(
        "x-api-key",
        "test_api_key_123"
      )
      .send(payload);



    expect(secondResponse.statusCode)
      .toBe(200);



    expect(
      secondResponse.body.data._id
    )
    .toBe(
      firstResponse.body.data._id
    );



    // Database verification

    const events = await Event.find({
      idempotencyKey: "idem_test_001"
    });


    expect(events.length)
      .toBe(1);



    const outboxEvents =
      await OutboxEvent.find({
        eventId: events[0]._id
      });


    expect(outboxEvents.length)
      .toBe(1);


  });

});