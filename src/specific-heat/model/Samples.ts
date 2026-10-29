/**
 * Samples.ts
 *
 * The solids a student can heat and drop into the cup. Specific heats are CRC Handbook values at
 * 25 °C, the ones OpenStax Chemistry 2e Table 5.1 reproduces; densities set the size of the
 * block drawn for a given mass. The two unknowns are real metals whose names stay hidden until
 * the student reveals them.
 */

export type SampleId = "aluminum" | "iron" | "copper" | "silver" | "lead" | "unknownA" | "unknownB";

/** Names a sample can be revealed as; the unknowns are titanium and magnesium. */
export type MetalName = "aluminum" | "iron" | "copper" | "silver" | "lead" | "titanium" | "magnesium";

export type Sample = {
  readonly id: SampleId;
  /** Specific heat (J/(g·°C)). */
  readonly specificHeat: number;
  /** Density (g/cm³). */
  readonly density: number;
  readonly unknown: boolean;
  readonly metal: MetalName;
};

export const SAMPLES: Readonly<Record<SampleId, Sample>> = {
  aluminum: { id: "aluminum", specificHeat: 0.897, density: 2.7, unknown: false, metal: "aluminum" },
  iron: { id: "iron", specificHeat: 0.449, density: 7.87, unknown: false, metal: "iron" },
  copper: { id: "copper", specificHeat: 0.385, density: 8.96, unknown: false, metal: "copper" },
  silver: { id: "silver", specificHeat: 0.235, density: 10.49, unknown: false, metal: "silver" },
  lead: { id: "lead", specificHeat: 0.129, density: 11.34, unknown: false, metal: "lead" },
  unknownA: { id: "unknownA", specificHeat: 0.523, density: 4.51, unknown: true, metal: "titanium" },
  unknownB: { id: "unknownB", specificHeat: 1.023, density: 1.74, unknown: true, metal: "magnesium" },
};

export const SAMPLE_LIST: readonly Sample[] = Object.values(SAMPLES);
