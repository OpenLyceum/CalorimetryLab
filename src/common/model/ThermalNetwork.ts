import { THERMAL_NETWORK_NUMERICS } from "../../CalorimetryLabConstants.js";
/**
 * ThermalNetwork.ts
 *
 * Lumped bodies exchanging heat: each body i has a heat capacity Cᵢ (J/°C) and one temperature
 * Tᵢ (°C). Bodies are joined to each other, and optionally to the room, by thermal conductances
 * G (W/°C), and a body can receive heat from a source (a reaction) at a given power (W):
 *
 *   Cᵢ dTᵢ/dt = Σⱼ Gᵢⱼ (Tⱼ − Tᵢ) + Gᵢ,room (T_room − Tᵢ) + Pᵢ
 *
 * Integrated with classical RK4 in substeps no longer than a tenth of the fastest time constant, so a
 * large frame step stays stable. Without room links the exchange terms cancel in pairs and
 * Σ CᵢTᵢ changes only by the heat the sources put in.
 */

export type ThermalLink = {
  readonly a: number;
  readonly b: number;
  /** Conductance between the two bodies (W/°C). */
  readonly conductance: number;
};

type ThermalBody = {
  readonly capacity: number;
  temperature: number;
  roomConductance: number;
};

function requireEntry<T>(entries: readonly T[], index: number): T {
  const entry = entries[index];
  if (entry === undefined) {
    throw new RangeError(`Missing thermal network entry at index ${index}`);
  }
  return entry;
}

export class ThermalNetwork {
  private readonly bodies: readonly ThermalBody[];
  private readonly links: readonly ThermalLink[];
  private readonly roomTemperature: number;

  public constructor(
    capacities: readonly number[],
    temperatures: readonly number[],
    links: readonly ThermalLink[],
    roomTemperature: number,
  ) {
    if (capacities.length !== temperatures.length) {
      throw new RangeError("Each thermal body requires a capacity and a temperature");
    }
    this.bodies = Array.from(capacities, (capacity, index) => {
      const temperature = requireEntry(temperatures, index);
      if (!Number.isFinite(capacity) || capacity <= 0 || !Number.isFinite(temperature)) {
        throw new RangeError("Thermal bodies require finite temperatures and positive finite capacities");
      }
      return { capacity, temperature, roomConductance: 0 };
    });
    this.links = links.map((link) => {
      requireEntry(this.bodies, link.a);
      requireEntry(this.bodies, link.b);
      return { ...link };
    });
    this.roomTemperature = roomTemperature;
  }

  public getTemperature(body: number): number {
    return requireEntry(this.bodies, body).temperature;
  }

  /** Conductance from a body to the room (W/°C). Zero means insulated. */
  public setRoomConductance(body: number, conductance: number): void {
    requireEntry(this.bodies, body).roomConductance = conductance;
  }

  /** Total heat content Σ CᵢTᵢ (J, relative to 0 °C). */
  public get energy(): number {
    return this.bodies.reduce((sum, body) => sum + body.capacity * body.temperature, 0);
  }

  /**
   * Advances by `dt` seconds. `powers[i]` (W) is heat delivered to body i at a constant rate over
   * the step; leave it out for no source.
   */
  public step(dt: number, powers: readonly number[] = []): void {
    if (!Number.isFinite(dt) || dt <= 0) {
      return;
    }
    const substeps = Math.max(
      1,
      Math.ceil(dt / (THERMAL_NETWORK_NUMERICS.MAX_TIME_CONSTANT_FRACTION * this.fastestTimeConstant())),
    );
    const h = dt / substeps;
    const rate = (temperatures: readonly number[]): number[] => {
      const flows = this.bodies.map(
        (body, i) => (powers[i] ?? 0) + body.roomConductance * (this.roomTemperature - requireEntry(temperatures, i)),
      );
      for (const link of this.links) {
        const flow = link.conductance * (requireEntry(temperatures, link.b) - requireEntry(temperatures, link.a));
        flows[link.a] = requireEntry(flows, link.a) + flow;
        flows[link.b] = requireEntry(flows, link.b) - flow;
      }
      return this.bodies.map((body, i) => requireEntry(flows, i) / body.capacity);
    };
    const offset = (base: readonly number[], k: readonly number[], f: number) =>
      base.map((t, i) => t + f * requireEntry(k, i));
    for (let s = 0; s < substeps; s++) {
      const t0 = this.bodies.map((body) => body.temperature);
      const k1 = rate(t0);
      const k2 = rate(offset(t0, k1, h / 2));
      const k3 = rate(offset(t0, k2, h / 2));
      const k4 = rate(offset(t0, k3, h));
      this.bodies.forEach((body, i) => {
        body.temperature +=
          (h / 6) * (requireEntry(k1, i) + 2 * requireEntry(k2, i) + 2 * requireEntry(k3, i) + requireEntry(k4, i));
      });
    }
  }

  /** Heat flowing from body `a` to body `b` along their link (W), positive when a is hotter. */
  public heatFlow(a: number, b: number): number {
    const link = this.links.find((l) => (l.a === a && l.b === b) || (l.a === b && l.b === a));
    return link ? link.conductance * (this.getTemperature(a) - this.getTemperature(b)) : 0;
  }

  /** Smallest Cᵢ / ΣGᵢ (s): the fastest relaxation in the network. */
  private fastestTimeConstant(): number {
    let fastest = Number.POSITIVE_INFINITY;
    this.bodies.forEach((body, i) => {
      let conductance = body.roomConductance;
      for (const link of this.links) {
        if (link.a === i || link.b === i) {
          conductance += link.conductance;
        }
      }
      if (conductance > 0) {
        fastest = Math.min(fastest, body.capacity / conductance);
      }
    });
    return fastest;
  }
}
