import { jest } from "@jest/globals";
import CircuitBreaker from "../src/utils/circuitBreaker.js";

describe("CircuitBreaker", () => {
  test("starts in CLOSED state", () => {
    const circuitBreaker = new CircuitBreaker();

    expect(circuitBreaker.getState()).toMatchObject({
      state: "CLOSED",
      failureCount: 0,
      openedAt: null
    });
  });

  test("opens after 3 consecutive failures", async () => {
    const circuitBreaker = new CircuitBreaker();

    const action = jest
      .fn()
      .mockRejectedValue(new Error("SMTP unavailable"));

    await expect(circuitBreaker.execute(action)).rejects.toThrow(
      "SMTP unavailable"
    );

    await expect(circuitBreaker.execute(action)).rejects.toThrow(
      "SMTP unavailable"
    );

    await expect(circuitBreaker.execute(action)).rejects.toThrow(
      "SMTP unavailable"
    );

    expect(circuitBreaker.getState().state).toBe("OPEN");
    expect(circuitBreaker.getState().failureCount).toBe(3);

    expect(action).toHaveBeenCalledTimes(3);
  });

  test("OPEN state fails fast without calling the dependency", async () => {
    const circuitBreaker = new CircuitBreaker();

    const action = jest
      .fn()
      .mockRejectedValue(new Error("SMTP unavailable"));

    // Trigger 3 failures → OPEN
    await expect(circuitBreaker.execute(action)).rejects.toThrow();
    await expect(circuitBreaker.execute(action)).rejects.toThrow();
    await expect(circuitBreaker.execute(action)).rejects.toThrow();

    action.mockClear();

    await expect(circuitBreaker.execute(action)).rejects.toThrow(
      "Email service temporarily unavailable"
    );

    expect(action).not.toHaveBeenCalled();
    expect(circuitBreaker.getState().state).toBe("OPEN");
  });

  test("transitions from OPEN to HALF_OPEN after cooldown", async () => {
    const circuitBreaker = new CircuitBreaker();

    const action = jest
      .fn()
      .mockRejectedValue(new Error("SMTP unavailable"));

    const dateNowSpy = jest
      .spyOn(Date, "now")
      .mockReturnValue(1000);

    // 3 failures → OPEN
    await expect(circuitBreaker.execute(action)).rejects.toThrow();
    await expect(circuitBreaker.execute(action)).rejects.toThrow();
    await expect(circuitBreaker.execute(action)).rejects.toThrow();

    expect(circuitBreaker.getState().state).toBe("OPEN");

    // 10 seconds later
    dateNowSpy.mockReturnValue(11000);

    const recoveryAction = jest.fn().mockResolvedValue({
      messageId: "recovery-success"
    });

    await circuitBreaker.execute(recoveryAction);

    expect(recoveryAction).toHaveBeenCalledTimes(1);
    expect(circuitBreaker.getState().state).toBe("CLOSED");

    dateNowSpy.mockRestore();
  });

  test("successful HALF_OPEN probe closes the circuit and resets failures", async () => {
    const circuitBreaker = new CircuitBreaker();

    const failingAction = jest
      .fn()
      .mockRejectedValue(new Error("SMTP unavailable"));

    const dateNowSpy = jest
      .spyOn(Date, "now")
      .mockReturnValue(1000);

    // CLOSED → OPEN
    await expect(circuitBreaker.execute(failingAction)).rejects.toThrow();
    await expect(circuitBreaker.execute(failingAction)).rejects.toThrow();
    await expect(circuitBreaker.execute(failingAction)).rejects.toThrow();

    dateNowSpy.mockReturnValue(11000);

    const recoveryAction = jest.fn().mockResolvedValue({
      messageId: "recovered"
    });

    await circuitBreaker.execute(recoveryAction);

    expect(circuitBreaker.getState()).toMatchObject({
      state: "CLOSED",
      failureCount: 0,
      openedAt: null
    });

    dateNowSpy.mockRestore();
  });

  test("failed HALF_OPEN probe reopens the circuit", async () => {
    const circuitBreaker = new CircuitBreaker();

    const failingAction = jest
      .fn()
      .mockRejectedValue(new Error("SMTP unavailable"));

    const dateNowSpy = jest
      .spyOn(Date, "now")
      .mockReturnValue(1000);

    // CLOSED → OPEN
    await expect(circuitBreaker.execute(failingAction)).rejects.toThrow();
    await expect(circuitBreaker.execute(failingAction)).rejects.toThrow();
    await expect(circuitBreaker.execute(failingAction)).rejects.toThrow();

    dateNowSpy.mockReturnValue(11000);

    // HALF_OPEN → failed probe → OPEN
    await expect(
      circuitBreaker.execute(failingAction)
    ).rejects.toThrow("SMTP unavailable");

    expect(circuitBreaker.getState().state).toBe("OPEN");

    dateNowSpy.mockRestore();
  });

  test("allows only one HALF_OPEN recovery probe at a time", async () => {
    const circuitBreaker = new CircuitBreaker();

    const failingAction = jest
      .fn()
      .mockRejectedValue(new Error("SMTP unavailable"));

    const dateNowSpy = jest
      .spyOn(Date, "now")
      .mockReturnValue(1000);

    // CLOSED → OPEN
    await expect(circuitBreaker.execute(failingAction)).rejects.toThrow();
    await expect(circuitBreaker.execute(failingAction)).rejects.toThrow();
    await expect(circuitBreaker.execute(failingAction)).rejects.toThrow();

    dateNowSpy.mockReturnValue(11000);

    let resolveProbe;

    const recoveryAction = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveProbe = resolve;
        })
    );

    // First request becomes the recovery probe
    const firstProbe = circuitBreaker.execute(recoveryAction);

    // Second request must fail fast
    await expect(
      circuitBreaker.execute(recoveryAction)
    ).rejects.toThrow("Email service temporarily unavailable");

    expect(recoveryAction).toHaveBeenCalledTimes(1);

    resolveProbe({ messageId: "recovered" });

    await firstProbe;

    expect(circuitBreaker.getState().state).toBe("CLOSED");

    dateNowSpy.mockRestore();
  });
});