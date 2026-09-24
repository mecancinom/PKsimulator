import { describe, it, expect } from "vitest";
import { mlMinToLHour, lHourToMlMin } from "../src/utils/units";

describe("Unit Conversions", () => {
  it("converts mL/min to L/h accurately", () => {
    // 100 mL/min * 60 min/h / 1000 mL/L = 6.0 L/h
    expect(mlMinToLHour(100)).toBeCloseTo(6.0, 5);
    // 50 mL/min = 3.0 L/h
    expect(mlMinToLHour(50)).toBeCloseTo(3.0, 5);
  });

  it("converts L/h to mL/min accurately", () => {
    // 6.0 L/h = 100 mL/min
    expect(lHourToMlMin(6.0)).toBeCloseTo(100.0, 5);
    // 3.0 L/h = 50 mL/min
    expect(lHourToMlMin(3.0)).toBeCloseTo(50.0, 5);
  });

  it("roundtrips conversions consistently", () => {
    const original = 85.5;
    const roundtrip = lHourToMlMin(mlMinToLHour(original));
    expect(roundtrip).toBeCloseTo(original, 5);
  });
});
