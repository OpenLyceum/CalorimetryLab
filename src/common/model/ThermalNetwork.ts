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

export class ThermalNetwork {
  /** Heat capacity of each body (J/°C). */
  public readonly capacities: readonly number[];

  /** Temperature of each body (°C). */
  public readonly temperatures: number[];

  public readonly links: readonly ThermalLink[];

  /** Conductance from each body to the room (W/°C); 0 means insulated. */
  public readonly roomConductances: number[];

  /** °C */
  public roomTemperature: number;

  public constructor(
    capacities: readonly number[],
    temperatures: readonly number[],
    links: readonly ThermalLink[],
    roomTemperature: number,
  ) {
    this.capacities = capacities;
    this.temperatures = [...temperatures];
    this.links = links;
    this.roomConductances = capacities.map(() => 0);
    this.roomTemperature = roomTemperature;
  }

  /** Total heat content Σ CᵢTᵢ (J, relative to 0 °C). */
  public get energy(): number {
    return this.capacities.reduce((sum, capacity, i) => sum + capacity * (this.temperatures[i] ?? 0), 0);
  }

  /**
   * Advances by `dt` seconds. `powers[i]` (W) is heat delivered to body i at a constant rate over
   * the step; leave it out for no source.
   */
  public step(dt: number, powers: readonly number[] = []): void {
    if (dt <= 0) {
      return;
    }
    const substeps = Math.max(1, Math.ceil(dt / (0.1 * this.fastestTimeConstant())));
    const h = dt / substeps;
    const n = this.temperatures.length;
    const rate = (temperatures: readonly number[]): number[] => {
      const flows = temperatures.map(
        (t, i) => (powers[i] ?? 0) + (this.roomConductances[i] ?? 0) * (this.roomTemperature - t),
      );
      for (const link of this.links) {
        const flow = link.conductance * ((temperatures[link.b] ?? 0) - (temperatures[link.a] ?? 0));
        flows[link.a] = (flows[link.a] ?? 0) + flow;
        flows[link.b] = (flows[link.b] ?? 0) - flow;
      }
      return flows.map((flow, i) => flow / (this.capacities[i] ?? 1));
    };
    const offset = (base: readonly number[], k: readonly number[], f: number) =>
      base.map((t, i) => t + f * (k[i] ?? 0));
    for (let s = 0; s < substeps; s++) {
      const t0 = this.temperatures;
      const k1 = rate(t0);
      const k2 = rate(offset(t0, k1, h / 2));
      const k3 = rate(offset(t0, k2, h / 2));
      const k4 = rate(offset(t0, k3, h));
      for (let i = 0; i < n; i++) {
        this.temperatures[i] =
          (t0[i] ?? 0) + (h / 6) * ((k1[i] ?? 0) + 2 * (k2[i] ?? 0) + 2 * (k3[i] ?? 0) + (k4[i] ?? 0));
      }
    }
  }

  /** Heat flowing from body `a` to body `b` along their link (W), positive when a is hotter. */
  public heatFlow(a: number, b: number): number {
    const link = this.links.find((l) => (l.a === a && l.b === b) || (l.a === b && l.b === a));
    return link ? link.conductance * ((this.temperatures[a] ?? 0) - (this.temperatures[b] ?? 0)) : 0;
  }

  /** Smallest Cᵢ / ΣGᵢ (s): the fastest relaxation in the network. */
  private fastestTimeConstant(): number {
    let fastest = Number.POSITIVE_INFINITY;
    this.capacities.forEach((capacity, i) => {
      let conductance = this.roomConductances[i] ?? 0;
      for (const link of this.links) {
        if (link.a === i || link.b === i) {
          conductance += link.conductance;
        }
      }
      if (conductance > 0) {
        fastest = Math.min(fastest, capacity / conductance);
      }
    });
    return fastest;
  }
}
