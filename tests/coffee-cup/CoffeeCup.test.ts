/**
 * CoffeeCup.test.ts
 *
 * Coffee-cup calorimetry against textbook numbers: HCl + NaOH, limiting reactants, an
 * endothermic dissolution, the drift-line extrapolation in a leaky cup, and the setups refused
 * because they would boil off or leave salt undissolved.
 */

import type { NumberProperty } from "scenerystack/axon";
import { describe, expect, it } from "vitest";
import {
  DISSOLVING_VOLUME_RANGE,
  INITIAL_TEMPERATURE_RANGE,
  METAL_MASS_RANGE,
  SOLUTE_MASS_RANGE,
  SOLUTION_CONCENTRATION_RANGE,
  SOLUTION_TEMPERATURE_RANGE,
  SOLUTION_VOLUME_RANGE,
} from "../../src/CalorimetryLabConstants.js";
import { CoffeeCupModel } from "../../src/coffee-cup/model/CoffeeCupModel.js";
import {
  COFFEE_CUP_REACTION_LIST,
  COFFEE_CUP_REACTIONS,
  type CoffeeCupReaction,
  type ReactionKind,
  reactionExtent,
  solubilityAt,
  solutionMass,
} from "../../src/coffee-cup/model/CoffeeCupReactions.js";
import { analyzeCoffeeCup } from "../../src/coffee-cup/model/coffeeCupAnalysis.js";

function runFor(model: CoffeeCupModel, seconds: number): void {
  for (let t = 0; t < seconds; t += 0.25) {
    model.run(0.25);
  }
}

/** Runs in 0.25 s steps until `time` s after mixing. */
function runUntil(model: CoffeeCupModel, time: number): void {
  while (model.elapsedTimeProperty.value < time - 1e-9) {
    model.run(0.25);
  }
}

function analysis(model: CoffeeCupModel) {
  const trial = model.trialProperty.value;
  if (!trial) {
    throw new Error("no trial");
  }
  return analyzeCoffeeCup(
    trial,
    model.idealProperty.value,
    model.initialTemperatureProperty.value,
    model.peakTemperatureProperty.value,
    model.driftLineProperty.value,
    model.extrapolateProperty.value,
  );
}

describe("coffee-cup reactions", () => {
  it("50 mL 1.0 M HCl + 50 mL 1.0 M NaOH: 0.050 mol in 100 g of solution", () => {
    const setup = new CoffeeCupModel().setup;
    expect(reactionExtent(setup)).toEqual({ moles: 0.05, limiting: "both" });
    expect(solutionMass(setup, 1)).toBe(100);
  });

  it("finds the limiting reactant", () => {
    const setup = { ...new CoffeeCupModel().setup, baseVolume: 40 };
    expect(reactionExtent(setup)).toEqual({ moles: 0.04, limiting: "base" });
    const magnesium = { ...setup, reaction: COFFEE_CUP_REACTIONS.mgHcl, acidVolume: 25, metalMass: 0.6 };
    // 0.025 mol HCl reacts with only 0.0125 mol Mg.
    expect(reactionExtent(magnesium).limiting).toBe("acid");
    expect(reactionExtent(magnesium).moles).toBeCloseTo(0.0125, 10);
  });
});

describe("setup limits", () => {
  it("refuses 0.6 g of Mg in 25 mL of 2 M HCl, which would reach 130 °C", () => {
    const model = modelWith(
      { acidVolume: 25, acidConcentration: 2, metalMass: 0.6, initialTemperature: 22 },
      COFFEE_CUP_REACTIONS.mgHcl,
    );
    const problem = model.setupProblemProperty.value;
    expect(problem?.kind).toBe("temperature");
    expect(problem?.temperature).toBeCloseTo(129.6, 1);
    model.mix();
    expect(model.phaseProperty.value).toBe("ready");
    expect(model.trialProperty.value).toBeNull();
  });

  it("refuses 10 g of KNO₃ in 50 mL from 15 °C, more than cold water dissolves", () => {
    const model = modelWith({ waterVolume: 50, soluteMass: 10, initialTemperature: 15 }, COFFEE_CUP_REACTIONS.kno3);
    const problem = model.setupProblemProperty.value;
    expect(problem?.kind).toBe("solubility");
    if (problem?.kind === "solubility") {
      // All 10 g dissolving would cool the solution to 1.25 °C, where 14.8 g per 100 g dissolve.
      expect(problem.temperature).toBeCloseTo(1.25, 2);
      expect(problem.amount).toBeCloseTo(20, 9);
      expect(problem.solubility).toBeCloseTo(14.81, 2);
    }
    model.mix();
    expect(model.phaseProperty.value).toBe("ready");
  });

  it("interpolates the KNO₃ solubility table", () => {
    const table = COFFEE_CUP_REACTIONS.kno3.solubility ?? [];
    expect(solubilityAt(table, 0)).toBeCloseTo(13.9, 9);
    expect(solubilityAt(table, 5)).toBeCloseTo(17.55, 9);
    expect(solubilityAt(table, 20)).toBeCloseTo(31.6, 9);
    // Held at the ends: solubility only rises above 20 °C, so this is the cautious value.
    expect(solubilityAt(table, 30)).toBeCloseTo(31.6, 9);
    expect(solubilityAt(table, -2)).toBeCloseTo(13.9, 9);
  });

  it("allows KNO₃ just up to saturation at the coldest the trial gets", () => {
    // Bisect for the largest mass of KNO₃ that 50 mL of water at 15 °C takes.
    let low = 1;
    let high = 10;
    for (let i = 0; i < 40; i++) {
      const middle = (low + high) / 2;
      const problem = modelWith(
        { waterVolume: 50, soluteMass: middle, initialTemperature: 15 },
        COFFEE_CUP_REACTIONS.kno3,
      ).setupProblemProperty.value;
      if (problem) {
        high = middle;
      } else {
        low = middle;
      }
    }
    expect(low).toBeGreaterThan(8);
    expect(low).toBeLessThan(8.5);
    const over = modelWith(
      { waterVolume: 50, soluteMass: low + 0.01, initialTemperature: 15 },
      COFFEE_CUP_REACTIONS.kno3,
    );
    expect(over.setupProblemProperty.value?.kind).toBe("solubility");

    // At the limit, the simulated solution never gets colder than the salt allows.
    const model = modelWith({ waterVolume: 50, soluteMass: low, initialTemperature: 15 }, COFFEE_CUP_REACTIONS.kno3);
    model.mix();
    const coldest = extremeTemperatures(model, 300).lowest;
    const amount = (100 * low) / 50;
    expect(solubilityAt(COFFEE_CUP_REACTIONS.kno3.solubility ?? [], coldest)).toBeGreaterThanOrEqual(amount - 1e-6);
    expect(analysis(model).enthalpy).toBeCloseTo(34.89, 1);
  });

  it("every allowed setup at the ends of the ranges stays liquid and fully dissolved", () => {
    let refused = 0;
    let allowed = 0;
    for (const { reaction, changes, ideal } of rangeEndCases()) {
      const model = modelWith(changes, reaction);
      model.idealProperty.value = ideal;
      if (model.setupProblemProperty.value) {
        refused++;
        continue;
      }
      allowed++;
      model.mix();
      const { lowest, highest } = extremeTemperatures(model, 300);
      const label = `${reaction.id} ${JSON.stringify(changes)} ${ideal ? "ideal" : "leaky"}`;
      expect(lowest, label).toBeGreaterThanOrEqual(SOLUTION_TEMPERATURE_RANGE.min);
      expect(highest, label).toBeLessThanOrEqual(SOLUTION_TEMPERATURE_RANGE.max);
      if (reaction.solubility) {
        const amount = (100 * model.soluteMassProperty.value) / model.waterVolumeProperty.value;
        expect(solubilityAt(reaction.solubility, lowest), label).toBeGreaterThanOrEqual(amount);
      }
    }
    // Both branches are exercised: the Mg, NaOH and KNO₃ extremes are refused, the rest run.
    expect(refused).toBeGreaterThan(0);
    expect(allowed).toBeGreaterThan(refused);
  });
});

/** Every reaction with each of its amount controls, and the starting temperature, at either end. */
function rangeEndCases(): { reaction: CoffeeCupReaction; changes: Record<string, number>; ideal: boolean }[] {
  const controls: Record<ReactionKind, string[]> = {
    neutralization: ["acidVolume", "acidConcentration", "baseVolume", "baseConcentration"],
    metalAcid: ["acidVolume", "acidConcentration", "metalMass"],
    dissolution: ["waterVolume", "soluteMass"],
  };
  const ends: Record<string, readonly number[]> = {
    acidVolume: [SOLUTION_VOLUME_RANGE.min, SOLUTION_VOLUME_RANGE.max],
    acidConcentration: [SOLUTION_CONCENTRATION_RANGE.min, SOLUTION_CONCENTRATION_RANGE.max],
    baseVolume: [SOLUTION_VOLUME_RANGE.min, SOLUTION_VOLUME_RANGE.max],
    baseConcentration: [SOLUTION_CONCENTRATION_RANGE.min, SOLUTION_CONCENTRATION_RANGE.max],
    waterVolume: [DISSOLVING_VOLUME_RANGE.min, DISSOLVING_VOLUME_RANGE.max],
    soluteMass: [SOLUTE_MASS_RANGE.min, SOLUTE_MASS_RANGE.max],
    metalMass: [METAL_MASS_RANGE.min, METAL_MASS_RANGE.max],
    initialTemperature: [INITIAL_TEMPERATURE_RANGE.min, INITIAL_TEMPERATURE_RANGE.max],
  };
  return COFFEE_CUP_REACTION_LIST.flatMap((reaction) => {
    let combinations: Record<string, number>[] = [{}];
    for (const key of [...controls[reaction.kind], "initialTemperature"]) {
      combinations = combinations.flatMap((changes) => (ends[key] ?? []).map((v) => ({ ...changes, [key]: v })));
    }
    return combinations.flatMap((changes) => [true, false].map((ideal) => ({ reaction, changes, ideal })));
  });
}

/** Runs a mixed trial for `seconds` in 1 s steps; the coldest and hottest temperatures reached. */
function extremeTemperatures(model: CoffeeCupModel, seconds: number): { lowest: number; highest: number } {
  let lowest = model.temperatureProperty.value;
  let highest = lowest;
  while (model.elapsedTimeProperty.value < seconds) {
    model.run(1);
    lowest = Math.min(lowest, model.temperatureProperty.value);
    highest = Math.max(highest, model.temperatureProperty.value);
  }
  return { lowest, highest };
}

/** A model for `reaction` after applying `changes` to its controls. */
function modelWith(changes: Partial<Record<string, number>>, reaction: CoffeeCupReaction): CoffeeCupModel {
  const model = new CoffeeCupModel();
  model.reactionProperty.value = reaction;
  const properties: Record<string, NumberProperty> = {
    acidVolume: model.acidVolumeProperty,
    acidConcentration: model.acidConcentrationProperty,
    baseVolume: model.baseVolumeProperty,
    baseConcentration: model.baseConcentrationProperty,
    waterVolume: model.waterVolumeProperty,
    soluteMass: model.soluteMassProperty,
    metalMass: model.metalMassProperty,
    initialTemperature: model.initialTemperatureProperty,
  };
  for (const [key, value] of Object.entries(changes)) {
    properties[key]?.set(value ?? 0);
  }
  return model;
}

describe("CoffeeCupModel", () => {
  it("HCl + NaOH warms 100 g of solution by 6.67 °C and gives back ΔH = −55.8 kJ/mol", () => {
    const model = new CoffeeCupModel();
    model.mix();
    runFor(model, 60);
    expect(model.temperatureProperty.value - 22).toBeCloseTo(6.674, 2);
    expect(analysis(model).enthalpy).toBeCloseTo(-55.84, 1);
  });

  it("dissolving ammonium nitrate cools the cup", () => {
    const model = new CoffeeCupModel();
    model.reactionProperty.value = COFFEE_CUP_REACTIONS.nh4no3;
    model.mix();
    runFor(model, 120);
    // 5.00 g / 80.043 g/mol × 25.69 kJ/mol = 1605 J out of 105 g of solution.
    expect(model.temperatureProperty.value - 22).toBeCloseTo(-1605 / (105 * 4.184), 2);
    expect(analysis(model).enthalpy).toBeCloseTo(25.69, 1);
  });

  it("a leaky cup peaks low, and extrapolating the drift recovers ΔH within 2 %", () => {
    const model = new CoffeeCupModel();
    model.reactionProperty.value = COFFEE_CUP_REACTIONS.mgHcl;
    model.metalMassProperty.value = 0.5;
    model.acidVolumeProperty.value = 100;
    model.idealProperty.value = false;
    model.mix();
    runFor(model, 300);
    model.extrapolateProperty.value = false;
    const peak = analysis(model);
    model.extrapolateProperty.value = true;
    const extrapolated = analysis(model);
    expect(extrapolated.extrapolated).toBe(true);
    expect(Math.abs(peak.enthalpy / -466.85 - 1)).toBeGreaterThan(0.02);
    expect(Math.abs(extrapolated.enthalpy / -466.85 - 1)).toBeLessThan(0.02);
  });

  it("the extrapolated ΔH of a leaky cup stays put however long the run goes on", () => {
    // Regression: a window that grew with the run gave −55.0, −49.1 and −37.2 kJ/mol at 300, 900
    // and 1800 s. The record thins itself at 1200 s and 2400 s, which must not move the line either.
    const model = new CoffeeCupModel();
    model.idealProperty.value = false;
    model.mix();
    const results = [300, 900, 1800, 3000].map((time) => {
      runUntil(model, time);
      return analysis(model);
    });
    const trace = model.record.traces[0] ?? [];
    expect((trace[1]?.x ?? 0) - (trace[0]?.x ?? 0)).toBeGreaterThan(1);
    for (const result of results) {
      expect(result.extrapolated).toBe(true);
      expect(result.enthalpy).toBe(results[0]?.enthalpy);
    }
    expect(Math.abs((results[0]?.enthalpy ?? 0) / -55.84 - 1)).toBeLessThan(0.005);
  });

  it("extrapolates warming and cooling runs, ideal or not, from any starting temperature", () => {
    for (const reaction of [COFFEE_CUP_REACTIONS.hclNaoh, COFFEE_CUP_REACTIONS.mgHcl, COFFEE_CUP_REACTIONS.kno3]) {
      for (const start of [15, 22, 30]) {
        for (const ideal of [true, false]) {
          const model = new CoffeeCupModel();
          model.reactionProperty.value = reaction;
          model.initialTemperatureProperty.value = start;
          model.idealProperty.value = ideal;
          model.mix();
          runUntil(model, 400);
          const early = analysis(model);
          runUntil(model, 1500);
          const late = analysis(model);
          const label = `${reaction.id} from ${start} °C, ${ideal ? "ideal" : "leaky"}`;
          expect(early.extrapolated, label).toBe(true);
          expect(late.enthalpy, label).toBe(early.enthalpy);
          // A leaky cup started 8 °C from room temperature drifts before the reaction does; a
          // straight line back to t = 0 then misses by up to 2 % (the peak misses by up to 14 %).
          expect(Math.abs(early.enthalpy / reaction.enthalpy - 1), label).toBeLessThan(ideal ? 0.001 : 0.02);
        }
      }
    }
  });

  it("New Trial empties the cup", () => {
    const model = new CoffeeCupModel();
    model.mix();
    runFor(model, 10);
    model.newTrial();
    expect(model.phaseProperty.value).toBe("ready");
    expect(model.temperatureProperty.value).toBe(22);
    expect(model.trialProperty.value).toBeNull();
  });
});
