/**
 * bombAnalysis.ts
 *
 * The calculation a student does with the bomb data.
 *
 * Calibrate: q = m × 26.434 kJ/g is known, so C_cal = q / ΔT.
 * Measure:   q_cal = C_cal ΔT, q_reaction = −q_cal, ΔcU = q_reaction / n, and
 *            ΔcH = ΔcU + Δn(gas)·RT converts the constant-volume result to an enthalpy.
 */

import { BOMB_START_TEMPERATURE } from "../../CalorimetryLabConstants.js";
import { type DriftLine, temperatureOnLine } from "../../common/model/extrapolation.js";
import { enthalpyFromInternalEnergy, type Fuel, heatReleased } from "./Fuels.js";

/** ΔT (°C): from the peak, or extrapolated back to ignition along the drift line. */
export function bombDeltaT(peakTemperature: number, drift: DriftLine | null, useExtrapolation: boolean): number {
  return (useExtrapolation && drift ? temperatureOnLine(drift, 0) : peakTemperature) - BOMB_START_TEMPERATURE;
}

/** Calorimeter constant from a benzoic-acid burn (kJ/°C). */
export function calibratedConstant(fuel: Fuel, mass: number, deltaT: number): number {
  return deltaT > 0 ? heatReleased(fuel, mass) / 1000 / deltaT : 0;
}

export type BombMeasurement = {
  /** kJ */
  readonly calorimeterHeat: number;
  /** kJ */
  readonly reactionHeat: number;
  /** kJ/g */
  readonly energyPerGram: number;
  readonly moles: number;
  /** kJ/mol */
  readonly internalEnergy: number;
  /** kJ/mol */
  readonly enthalpy: number;
};

/** Measure-mode result with the student's calorimeter constant (kJ/°C). */
export function measure(fuel: Fuel, mass: number, deltaT: number, calorimeterConstant: number): BombMeasurement {
  const calorimeterHeat = calorimeterConstant * deltaT;
  const reactionHeat = -calorimeterHeat;
  const moles = mass / fuel.molarMass;
  const internalEnergy = reactionHeat / moles;
  return {
    calorimeterHeat,
    reactionHeat,
    energyPerGram: reactionHeat / mass,
    moles,
    internalEnergy,
    enthalpy: enthalpyFromInternalEnergy(internalEnergy, fuel.gasMolesChange),
  };
}
