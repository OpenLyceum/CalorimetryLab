/**
 * extrapolation.test.ts
 *
 * The drift line recovers the temperature at the start of a run from a fixed window of the drift,
 * and does not move once that window has been recorded.
 */

import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import { driftLine, fitLine, temperatureOnLine } from "../../src/common/model/extrapolation.js";

/** Samples every `step` s from 0 to `end` s. */
function sampled(end: number, step: number, temperature: (t: number) => number): Vector2[] {
  const trace: Vector2[] = [];
  for (let t = 0; t <= end + 1e-9; t += step) {
    trace.push(new Vector2(t, temperature(t)));
  }
  return trace;
}

describe("extrapolation", () => {
  it("fits a straight line exactly", () => {
    const line = fitLine([new Vector2(0, 1), new Vector2(1, 3), new Vector2(2, 5)]);
    expect(line.slope).toBeCloseTo(2, 12);
    expect(line.intercept).toBeCloseTo(1, 12);
  });

  it("waits until the whole window has been recorded", () => {
    const trace = sampled(79.5, 0.5, (t) => 20 + Math.min(t, 3));
    expect(driftLine(trace, 20, 60)).toBeNull();
    trace.push(new Vector2(80, 23));
    expect(driftLine(trace, 20, 60)).toMatchObject({ fromTime: 20, toTime: 80 });
  });

  it("extrapolates a rise-then-drift trace back to time zero", () => {
    // Fast rise to 26.7 °C, then a drift of −0.01 °C/s from a line that starts at 26.7 °C.
    const trace = sampled(120, 0.5, (t) => 20 + 6.7 * (1 - Math.exp(-t / 2)) - 0.01 * t);
    const line = driftLine(trace, 30, 60);
    expect(line).not.toBeNull();
    if (line) {
      expect(line.slope).toBeCloseTo(-0.01, 6);
      expect(temperatureOnLine(line, 0)).toBeCloseTo(26.7, 4);
    }
  });

  it("follows a cooling run as well", () => {
    const trace = sampled(100, 1, (t) => 22 - 3 * (1 - Math.exp(-t / 3)) + 0.004 * t);
    const line = driftLine(trace, 30, 60);
    expect(line && temperatureOnLine(line, 0)).toBeCloseTo(19, 3);
  });

  it("does not creep along an exponential approach to room temperature", () => {
    // 6 °C above a 22 °C room, relaxing with τ = 1000 s, as a leaky cup does after its reaction.
    const curve = (t: number) => 22 + 6 * Math.exp(-t / 1000);
    const early = driftLine(sampled(200, 0.5, curve), 60, 60);
    const late = driftLine(sampled(2000, 0.5, curve), 60, 60);
    expect(early).not.toBeNull();
    expect(late).toEqual(early);
    // A line through 60–120 s misses the curve's start by only its bend, (90 s / τ)²/2 × 6 °C ≈ 0.02 °C.
    expect(early && temperatureOnLine(early, 0)).toBeCloseTo(28, 1);
  });
});
