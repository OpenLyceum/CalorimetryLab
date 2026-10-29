/**
 * CoffeeCup.test.ts
 *
 * Coffee-cup calorimetry against textbook numbers: HCl + NaOH, limiting reactants, an
 * endothermic dissolution, and the drift-line extrapolation in a leaky cup.
 */

import { describe, expect, it } from "vitest";
import { CoffeeCupModel } from "../../src/coffee-cup/model/CoffeeCupModel.js";
import { COFFEE_CUP_REACTIONS, reactionExtent, solutionMass } from "../../src/coffee-cup/model/CoffeeCupReactions.js";
import { analyzeCoffeeCup } from "../../src/coffee-cup/model/coffeeCupAnalysis.js";

function runFor(model: CoffeeCupModel, seconds: number): void {
  for (let t = 0; t < seconds; t += 0.25) {
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
