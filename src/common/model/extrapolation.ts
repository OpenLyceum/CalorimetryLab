/**
 * extrapolation.ts
 *
 * The textbook correction for heat lost (or gained) while a reaction runs: once the reaction is
 * over, the calorimeter drifts slowly toward room temperature along an almost straight line. A
 * least-squares line through that drift, followed back to the moment of mixing, gives the
 * temperature the solution would have reached had the reaction been instantaneous.
 *
 * The drift is really an exponential approach to room temperature, so the line is fitted over a
 * fixed window just after the heat has all arrived, as in a real lab's post-period. A window
 * that kept growing with the run would follow the curve further and further from the start, and
 * the result would creep the longer the trial ran.
 */

import type { Vector2 } from "scenerystack/dot";
import { EXTRAPOLATION_FIT_DURATION } from "../../CalorimetryLabConstants.js";

export type DriftLine = {
  readonly slope: number;
  readonly intercept: number;
  /** Start and end of the window the line was fitted over (s). */
  readonly fromTime: number;
  readonly toTime: number;
};

/** Record times accumulate frame steps, so window edges allow for round-off (s). */
const TIME_TOLERANCE = 1e-6;

/** Least-squares line through the points. */
export function fitLine(points: readonly Vector2[]): { slope: number; intercept: number } {
  const n = points.length;
  const meanX = points.reduce((s, p) => s + p.x, 0) / n;
  const meanY = points.reduce((s, p) => s + p.y, 0) / n;
  let sxx = 0;
  let sxy = 0;
  for (const p of points) {
    sxx += (p.x - meanX) ** 2;
    sxy += (p.x - meanX) * (p.y - meanY);
  }
  const slope = sxx > 0 ? sxy / sxx : 0;
  return { slope, intercept: meanY - slope * meanX };
}

/**
 * The drift line through the points of `trace` from `fromTime` to `fromTime + duration`; null
 * until the trace has reached the end of that window. Points recorded later never change it.
 */
export function driftLine(
  trace: readonly Vector2[],
  fromTime: number,
  duration = EXTRAPOLATION_FIT_DURATION,
): DriftLine | null {
  const toTime = fromTime + duration;
  const lastTime = trace[trace.length - 1]?.x ?? Number.NEGATIVE_INFINITY;
  if (lastTime < toTime - TIME_TOLERANCE) {
    return null;
  }
  const points = trace.filter((point) => point.x >= fromTime - TIME_TOLERANCE && point.x <= toTime + TIME_TOLERANCE);
  if (points.length < 3) {
    return null;
  }
  return { ...fitLine(points), fromTime, toTime };
}

/** Temperature on the line at `time`. */
export function temperatureOnLine(line: DriftLine, time: number): number {
  return line.intercept + line.slope * time;
}
