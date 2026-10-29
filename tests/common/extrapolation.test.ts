/**
 * extrapolation.test.ts
 *
 * The drift line recovers the temperature at the start of a run from the post-peak drift.
 */

import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import { driftLine, fitLine, temperatureOnLine } from "../../src/common/model/extrapolation.js";

describe("extrapolation", () => {
  it("fits a straight line exactly", () => {
    const line = fitLine([new Vector2(0, 1), new Vector2(1, 3), new Vector2(2, 5)]);
    expect(line.slope).toBeCloseTo(2, 12);
    expect(line.intercept).toBeCloseTo(1, 12);
  });

  it("waits for enough drift after the peak", () => {
    const trace = [0, 1, 2, 3, 4, 5].map((t) => new Vector2(t, 20 + Math.min(t, 3)));
    expect(driftLine(trace, 20)).toBeNull();
  });

  it("extrapolates a rise-then-drift trace back to time zero", () => {
    // Fast rise to 26.7 °C, then a drift of −0.01 °C/s from a line that starts at 26.7 °C.
    const trace: Vector2[] = [];
    for (let t = 0; t <= 120; t += 0.5) {
      const rise = 1 - Math.exp(-t / 2);
      trace.push(new Vector2(t, 20 + 6.7 * rise - 0.01 * t));
    }
    const line = driftLine(trace, 20);
    expect(line).not.toBeNull();
    if (line) {
      expect(line.slope).toBeCloseTo(-0.01, 6);
      expect(temperatureOnLine(line, 0)).toBeCloseTo(26.7, 4);
    }
  });

  it("follows a cooling run as well", () => {
    const trace: Vector2[] = [];
    for (let t = 0; t <= 100; t += 1) {
      trace.push(new Vector2(t, 22 - 3 * (1 - Math.exp(-t / 3)) + 0.004 * t));
    }
    const line = driftLine(trace, 22);
    expect(line && temperatureOnLine(line, 0)).toBeCloseTo(19, 3);
  });
});
