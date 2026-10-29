/**
 * extrapolation.ts
 *
 * The textbook correction for heat lost (or gained) while a reaction runs: after the temperature
 * peaks, the calorimeter drifts slowly toward room temperature along an almost straight line. A
 * least-squares line through that drift, followed back to the moment of mixing, gives the
 * temperature the solution would have reached had the reaction been instantaneous.
 */

import type { Vector2 } from "scenerystack/dot";
import { EXTRAPOLATION_MIN_DRIFT_TIME } from "../../CalorimetryLabConstants.js";

export type DriftLine = {
  readonly slope: number;
  readonly intercept: number;
  /** First and last times of the points the line was fitted to (s). */
  readonly fromTime: number;
  readonly toTime: number;
};

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
 * The drift line after the peak of `trace`, which started at `startTemperature`; null until the
 * run has drifted for EXTRAPOLATION_MIN_DRIFT_TIME after the peak. The fit uses the later half of
 * the post-peak points, where the reaction has finished.
 */
export function driftLine(trace: readonly Vector2[], startTemperature: number): DriftLine | null {
  if (trace.length < 4) {
    return null;
  }
  let peakIndex = 0;
  trace.forEach((point, index) => {
    if (Math.abs(point.y - startTemperature) > Math.abs((trace[peakIndex]?.y ?? 0) - startTemperature)) {
      peakIndex = index;
    }
  });
  const peakTime = trace[peakIndex]?.x ?? 0;
  const lastTime = trace[trace.length - 1]?.x ?? 0;
  if (lastTime - peakTime < EXTRAPOLATION_MIN_DRIFT_TIME) {
    return null;
  }
  const fromTime = (peakTime + lastTime) / 2;
  const points = trace.filter((point) => point.x >= fromTime);
  if (points.length < 3) {
    return null;
  }
  return { ...fitLine(points), fromTime, toTime: lastTime };
}

/** Temperature on the line at `time`. */
export function temperatureOnLine(line: DriftLine, time: number): number {
  return line.intercept + line.slope * time;
}
