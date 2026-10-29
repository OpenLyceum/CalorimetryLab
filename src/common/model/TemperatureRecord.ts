/**
 * TemperatureRecord.ts
 *
 * The temperatures a run has recorded, for the charts and the extrapolation: one list of
 * (time, temperature) points per trace, sampled every RECORD_INTERVAL of simulated time. When a
 * long run fills the record, every other point is dropped and the interval doubles, so the whole
 * run always fits.
 */

import { Emitter } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { RECORD_CAPACITY, RECORD_INTERVAL } from "../../CalorimetryLabConstants.js";

export class TemperatureRecord {
  /** One list of points (x = time in s, y = temperature in °C) per trace. */
  public readonly traces: Vector2[][];

  /** Fires after points are added or the record is cleared. */
  public readonly changedEmitter = new Emitter();

  private interval = RECORD_INTERVAL;
  private lastTime = Number.NEGATIVE_INFINITY;

  public constructor(traceCount: number) {
    this.traces = Array.from({ length: traceCount }, () => []);
  }

  /** Records the temperatures at `time` if a sampling interval has passed since the last point. */
  public record(time: number, temperatures: readonly number[]): void {
    if (time - this.lastTime < this.interval - 1e-9) {
      return;
    }
    this.lastTime = time;
    this.traces.forEach((trace, i) => {
      trace.push(new Vector2(time, temperatures[i] ?? 0));
    });
    if ((this.traces[0]?.length ?? 0) > RECORD_CAPACITY) {
      for (const trace of this.traces) {
        const kept = trace.filter((_point, index) => index % 2 === 0 || index === trace.length - 1);
        trace.length = 0;
        trace.push(...kept);
      }
      this.interval *= 2;
    }
    this.changedEmitter.emit();
  }

  public clear(): void {
    for (const trace of this.traces) {
      trace.length = 0;
    }
    this.interval = RECORD_INTERVAL;
    this.lastTime = Number.NEGATIVE_INFINITY;
    this.changedEmitter.emit();
  }

  public dispose(): void {
    this.changedEmitter.dispose();
  }
}
