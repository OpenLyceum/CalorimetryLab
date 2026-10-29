/**
 * coffeeCupAnalysis.ts
 *
 * The calculation a student does with the coffee-cup data:
 *
 *   q_solution = m c ΔT,  q_cup = C_cup ΔT (non-ideal cup only),
 *   q_reaction = −(q_solution + q_cup),  ΔH = q_reaction / n.
 *
 * ΔT is the peak change, or, when asked and available, the change extrapolated back to the
 * moment of mixing along the drift line.
 */

import { CUP_HEAT_CAPACITY, SOLUTION_DENSITY, WATER_SPECIFIC_HEAT } from "../../CalorimetryLabConstants.js";
import { type DriftLine, temperatureOnLine } from "../../common/model/extrapolation.js";
import { type CoffeeCupSetup, type LimitingReactant, reactionExtent, solutionMass } from "./CoffeeCupReactions.js";

export type CoffeeCupAnalysis = {
  readonly deltaT: number;
  readonly extrapolated: boolean;
  readonly solutionMass: number;
  /** J */
  readonly solutionHeat: number;
  /** J; 0 for an ideal cup. */
  readonly cupHeat: number;
  /** J */
  readonly reactionHeat: number;
  readonly moles: number;
  readonly limiting: LimitingReactant;
  /** kJ/mol */
  readonly enthalpy: number;
};

export function analyzeCoffeeCup(
  trial: CoffeeCupSetup,
  ideal: boolean,
  startTemperature: number,
  peakTemperature: number,
  drift: DriftLine | null,
  useExtrapolation: boolean,
): CoffeeCupAnalysis {
  const extrapolated = useExtrapolation && drift !== null;
  const deltaT = (extrapolated && drift ? temperatureOnLine(drift, 0) : peakTemperature) - startTemperature;
  const mass = solutionMass(trial, SOLUTION_DENSITY);
  const solutionHeat = mass * WATER_SPECIFIC_HEAT * deltaT;
  const cupHeat = ideal ? 0 : CUP_HEAT_CAPACITY * deltaT;
  const reactionHeat = -(solutionHeat + cupHeat);
  const { moles, limiting } = reactionExtent(trial);
  return {
    deltaT,
    extrapolated,
    solutionMass: mass,
    solutionHeat,
    cupHeat,
    reactionHeat,
    moles,
    limiting,
    enthalpy: moles > 0 ? reactionHeat / moles / 1000 : 0,
  };
}
