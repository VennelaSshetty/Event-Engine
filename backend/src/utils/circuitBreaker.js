import AppError from "./AppError.js";
import config from "../config/env.js";

class CircuitBreaker {
  constructor() {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.openedAt = null;
    this.halfOpenProbeInProgress = false;

    this.failureThreshold = config.circuitBreakerFailureThreshold;
    this.cooldown = config.circuitBreakerCooldown;
  }

  async execute(action) {
    if (this.state === "OPEN") {
      const cooldownElapsed =
        Date.now() - this.openedAt >= this.cooldown;

      if (!cooldownElapsed) {
        throw new AppError(
          "Email service temporarily unavailable",
          503,
          true
        );
      }

      this.state = "HALF_OPEN";
    }

    if (this.state === "HALF_OPEN") {
      if (this.halfOpenProbeInProgress) {
        throw new AppError(
          "Email service temporarily unavailable",
          503,
          true
        );
      }

      this.halfOpenProbeInProgress = true;
    }

    try {
      const result = await action();

      this.onSuccess();

      return result;
    } catch (error) {
      this.onFailure();

      throw error;
    } finally {
      if (this.state === "HALF_OPEN") {
        this.halfOpenProbeInProgress = false;
      }
    }
  }

  onSuccess() {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.openedAt = null;
    this.halfOpenProbeInProgress = false;
  }

  onFailure() {
    if (this.state === "HALF_OPEN") {
      this.openCircuit();
      return;
    }

    this.failureCount += 1;

    if (this.failureCount >= this.failureThreshold) {
      this.openCircuit();
    }
  }

  openCircuit() {
    this.state = "OPEN";
    this.openedAt = Date.now();
    this.halfOpenProbeInProgress = false;
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      openedAt: this.openedAt
    };
  }
}

export default CircuitBreaker;