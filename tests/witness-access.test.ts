import { describe, expect, it } from "vitest";
import { isWitnessActive, witnessExpiration } from "../src/lib/witness-access";

const now = new Date("2026-07-27T12:00:00.000Z");

describe("witness lifecycle", () => {
  it("keeps a long-term active witness available", () => {
    expect(isWitnessActive({ status: "active", expiresAt: null }, now)).toBe(true);
  });

  it("rejects paused and expired witnesses", () => {
    expect(isWitnessActive({ status: "paused", expiresAt: null }, now)).toBe(false);
    expect(isWitnessActive({ status: "active", expiresAt: new Date("2026-07-27T11:59:59.000Z") }, now)).toBe(false);
    expect(isWitnessActive({ status: "active", expiresAt: now }, now)).toBe(false);
  });

  it("calculates fixed UTC expiry windows", () => {
    expect(witnessExpiration("7", now)?.toISOString()).toBe("2026-08-03T12:00:00.000Z");
    expect(witnessExpiration("30", now)?.toISOString()).toBe("2026-08-26T12:00:00.000Z");
    expect(witnessExpiration("never", now)).toBeNull();
  });
});
