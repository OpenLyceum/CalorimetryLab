/**
 * CoffeeCupReactions.ts
 *
 * The reactions run in the coffee-cup calorimeter, with their standard enthalpies at 25 °C
 * (kJ per mole of the reaction as written). Sources and derivations are in doc/model.md:
 *
 * - Neutralization, H⁺(aq) + OH⁻(aq) → H₂O(l): from ΔHf° of H₂O(l) and OH⁻(aq).
 * - Enthalpies of solution at infinite dilution (CRC Handbook, "Enthalpy of Solution of
 *   Electrolytes").
 * - Mg(s) + 2H⁺(aq) → Mg²⁺(aq) + H₂(g): ΔHf° of Mg²⁺(aq).
 *
 * Each reaction runs with first-order kinetics; `timeConstant` is the e-folding time (s) of the
 * mixing, dissolving or metal reacting.
 *
 * A trial must stay liquid, below the temperature where evaporation matters, and (for a salt)
 * below saturation at the coldest it gets; `setupProblem` says why a setup cannot be mixed.
 */

import {
  DRIFT_START_TIME_CONSTANTS,
  ROOM_TEMPERATURE,
  SOLUTION_DENSITY,
  SOLUTION_TEMPERATURE_RANGE,
  WATER_SPECIFIC_HEAT,
} from "../../CalorimetryLabConstants.js";

/** Solubility of a salt: [temperature (°C), grams per 100 g of water], in rising temperature. */
export type SolubilityTable = readonly (readonly [number, number])[];

export type ReactionKind = "neutralization" | "dissolution" | "metalAcid";

export type CoffeeCupReactionId = "hclNaoh" | "nh4no3" | "naoh" | "cacl2" | "nh4cl" | "kno3" | "mgHcl";

export type CoffeeCupReaction = {
  readonly id: CoffeeCupReactionId;
  readonly kind: ReactionKind;
  /** Equation as RichText markup. */
  readonly equation: string;
  /** Formula of what n counts (per mole of …), as RichText markup. */
  readonly perMoleOf: string;
  /** ΔH of the reaction as written (kJ/mol). */
  readonly enthalpy: number;
  /** Molar mass of the solid added (g/mol); 0 for neutralization. */
  readonly molarMass: number;
  /** e-folding time of the reaction (s). */
  readonly timeConstant: number;
  /**
   * Solubility of a salt that the mass and volume ranges can exceed when cold; absent when the
   * ranges stay below the salt's solubility at 0 °C.
   */
  readonly solubility?: SolubilityTable;
};

export const COFFEE_CUP_REACTIONS: Readonly<Record<CoffeeCupReactionId, CoffeeCupReaction>> = {
  hclNaoh: {
    id: "hclNaoh",
    kind: "neutralization",
    equation: "HCl(aq) + NaOH(aq) → NaCl(aq) + H<sub>2</sub>O(l)",
    perMoleOf: "H<sub>2</sub>O",
    enthalpy: -55.84,
    molarMass: 0,
    timeConstant: 3,
  },
  nh4no3: {
    id: "nh4no3",
    kind: "dissolution",
    equation: "NH<sub>4</sub>NO<sub>3</sub>(s) → NH<sub>4</sub><sup>+</sup>(aq) + NO<sub>3</sub><sup>−</sup>(aq)",
    perMoleOf: "NH<sub>4</sub>NO<sub>3</sub>",
    enthalpy: 25.69,
    molarMass: 80.043,
    timeConstant: 10,
  },
  naoh: {
    id: "naoh",
    kind: "dissolution",
    equation: "NaOH(s) → Na<sup>+</sup>(aq) + OH<sup>−</sup>(aq)",
    perMoleOf: "NaOH",
    enthalpy: -44.51,
    molarMass: 39.997,
    timeConstant: 8,
  },
  cacl2: {
    id: "cacl2",
    kind: "dissolution",
    equation: "CaCl<sub>2</sub>(s) → Ca<sup>2+</sup>(aq) + 2Cl<sup>−</sup>(aq)",
    perMoleOf: "CaCl<sub>2</sub>",
    enthalpy: -81.3,
    molarMass: 110.98,
    timeConstant: 8,
  },
  nh4cl: {
    id: "nh4cl",
    kind: "dissolution",
    equation: "NH<sub>4</sub>Cl(s) → NH<sub>4</sub><sup>+</sup>(aq) + Cl<sup>−</sup>(aq)",
    perMoleOf: "NH<sub>4</sub>Cl",
    enthalpy: 14.78,
    molarMass: 53.491,
    timeConstant: 8,
  },
  kno3: {
    id: "kno3",
    kind: "dissolution",
    equation: "KNO<sub>3</sub>(s) → K<sup>+</sup>(aq) + NO<sub>3</sub><sup>−</sup>(aq)",
    perMoleOf: "KNO<sub>3</sub>",
    enthalpy: 34.89,
    molarMass: 101.1,
    timeConstant: 12,
    // Haifa Group product catalogue, potassium nitrate solubility table.
    solubility: [
      [0, 13.9],
      [10, 21.2],
      [20, 31.6],
    ],
  },
  mgHcl: {
    id: "mgHcl",
    kind: "metalAcid",
    equation: "Mg(s) + 2HCl(aq) → MgCl<sub>2</sub>(aq) + H<sub>2</sub>(g)",
    perMoleOf: "Mg",
    enthalpy: -466.85,
    molarMass: 24.305,
    timeConstant: 15,
  },
};

export const COFFEE_CUP_REACTION_LIST: readonly CoffeeCupReaction[] = Object.values(COFFEE_CUP_REACTIONS);

/** Amounts in one trial (volumes in mL, concentrations in M, masses in g). */
export type CoffeeCupSetup = {
  readonly reaction: CoffeeCupReaction;
  readonly acidVolume: number;
  readonly acidConcentration: number;
  readonly baseVolume: number;
  readonly baseConcentration: number;
  readonly waterVolume: number;
  readonly soluteMass: number;
  readonly metalMass: number;
};

/** Which reactant runs out first; "both" when they are in exact proportion. */
export type LimitingReactant = "acid" | "base" | "metal" | "solid" | "both";

/** Moles of reaction (per mole of `perMoleOf`) when the reaction is complete, and what limits it. */
export function reactionExtent(setup: CoffeeCupSetup): { moles: number; limiting: LimitingReactant } {
  const { reaction } = setup;
  if (reaction.kind === "neutralization") {
    const acid = (setup.acidVolume / 1000) * setup.acidConcentration;
    const base = (setup.baseVolume / 1000) * setup.baseConcentration;
    const limiting = Math.abs(acid - base) < 1e-12 ? "both" : acid < base ? "acid" : "base";
    return { moles: Math.min(acid, base), limiting };
  }
  if (reaction.kind === "metalAcid") {
    const metal = setup.metalMass / reaction.molarMass;
    // Two HCl per Mg.
    const acid = (setup.acidVolume / 1000) * setup.acidConcentration;
    const limiting = Math.abs(metal - acid / 2) < 1e-12 ? "both" : metal < acid / 2 ? "metal" : "acid";
    return { moles: Math.min(metal, acid / 2), limiting };
  }
  return { moles: setup.soluteMass / reaction.molarMass, limiting: "solid" };
}

/** Mass of the final solution (g): the liquids at 1.00 g/mL plus any solid that dissolves. */
export function solutionMass(setup: CoffeeCupSetup, density: number): number {
  const { reaction } = setup;
  if (reaction.kind === "neutralization") {
    return (setup.acidVolume + setup.baseVolume) * density;
  }
  if (reaction.kind === "metalAcid") {
    return setup.acidVolume * density + Math.min(setup.metalMass, reactionExtent(setup).moles * reaction.molarMass);
  }
  return setup.waterVolume * density + setup.soluteMass;
}

/** When the drift-line window opens (s after mixing): the reaction is then all but complete. */
export function driftStartTime(reaction: CoffeeCupReaction): number {
  return DRIFT_START_TIME_CONSTANTS * reaction.timeConstant;
}

/**
 * Temperature (°C) the solution reaches in an ideal cup once the reaction is complete. A real cup
 * changes less, since the cup takes some of the heat.
 */
export function finalTemperature(setup: CoffeeCupSetup, initialTemperature: number): number {
  const capacity = solutionMass(setup, SOLUTION_DENSITY) * WATER_SPECIFIC_HEAT;
  return initialTemperature - (setup.reaction.enthalpy * 1000 * reactionExtent(setup).moles) / capacity;
}

/**
 * Solubility (g per 100 g of water) at `temperature` (°C), interpolated linearly in the table
 * and held at the end values beyond it. Solubility rises with temperature, so holding the last
 * value above the table is the cautious choice.
 */
export function solubilityAt(table: SolubilityTable, temperature: number): number {
  const first = table[0];
  const last = table[table.length - 1];
  if (!(first && last)) {
    return Number.POSITIVE_INFINITY;
  }
  if (temperature <= first[0]) {
    return first[1];
  }
  for (let i = 1; i < table.length; i++) {
    const [t0, s0] = table[i - 1] ?? first;
    const [t1, s1] = table[i] ?? last;
    if (temperature <= t1) {
      return s0 + ((s1 - s0) * (temperature - t0)) / (t1 - t0);
    }
  }
  return last[1];
}

/** Why a setup cannot be mixed: it leaves the liquid range, or the salt cannot all dissolve. */
export type SetupProblem =
  | { readonly kind: "temperature"; readonly temperature: number }
  | {
      readonly kind: "solubility";
      readonly temperature: number;
      /** g of salt per 100 g of water in the setup */
      readonly amount: number;
      /** g per 100 g of water that dissolve at `temperature` */
      readonly solubility: number;
    };

/**
 * The reason this setup, started at `initialTemperature`, falls outside what the model covers, or
 * null when it can be mixed. A trial's temperature stays between the start, the ideal-cup final
 * temperature and (for a leaky cup) the room, so those bound every run: the solution must stay
 * inside SOLUTION_TEMPERATURE_RANGE, and a salt must all dissolve at the coldest of them.
 */
export function setupProblem(setup: CoffeeCupSetup, initialTemperature: number): SetupProblem | null {
  const final = finalTemperature(setup, initialTemperature);
  const highest = Math.max(final, initialTemperature, ROOM_TEMPERATURE);
  const lowest = Math.min(final, initialTemperature, ROOM_TEMPERATURE);
  if (highest > SOLUTION_TEMPERATURE_RANGE.max) {
    return { kind: "temperature", temperature: highest };
  }
  if (lowest < SOLUTION_TEMPERATURE_RANGE.min) {
    return { kind: "temperature", temperature: lowest };
  }
  const table = setup.reaction.solubility;
  if (setup.reaction.kind === "dissolution" && table) {
    const amount = (100 * setup.soluteMass) / (setup.waterVolume * SOLUTION_DENSITY);
    const solubility = solubilityAt(table, lowest);
    if (amount > solubility) {
      return { kind: "solubility", temperature: lowest, amount, solubility };
    }
  }
  return null;
}
