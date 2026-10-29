/**
 * Bomb.test.ts
 *
 * Calibrating with benzoic acid recovers the hidden calorimeter constant; a calibrated bomb
 * measures ΔcU and, through Δn(gas)·RT, ΔcH.
 */

import { describe, expect, it } from "vitest";
import { BombCalorimeterModel, TRUE_CALORIMETER_CONSTANT } from "../../src/bomb/model/BombCalorimeterModel.js";
import { bombDeltaT, calibratedConstant, measure } from "../../src/bomb/model/bombAnalysis.js";
import { enthalpyFromInternalEnergy, FUELS, heatReleased } from "../../src/bomb/model/Fuels.js";

function runFor(model: BombCalorimeterModel, seconds: number): void {
  for (let t = 0; t < seconds; t += 1) {
    model.run(1);
  }
}

function deltaT(model: BombCalorimeterModel): number {
  return bombDeltaT(
    model.peakTemperatureProperty.value,
    model.driftLineProperty.value,
    model.extrapolateProperty.value,
  );
}

describe("fuels", () => {
  it("1.000 g of benzoic acid releases 26.434 kJ", () => {
    expect(heatReleased(FUELS.benzoicAcid, 1)).toBeCloseTo(26434, 6);
  });

  it("converts ΔU to ΔH with Δn(gas)·RT", () => {
    // Naphthalene: Δn = −2, so ΔcU is 4.96 kJ/mol less negative than ΔcH.
    expect(enthalpyFromInternalEnergy(FUELS.naphthalene.internalEnergy, -2)).toBeCloseTo(-5156, 6);
    expect(FUELS.naphthalene.internalEnergy).toBeCloseTo(-5151.04, 2);
    expect(FUELS.sucrose.internalEnergy).toBe(-5644);
  });
});

describe("BombCalorimeterModel", () => {
  it("the calorimeter holds 10.20 kJ/°C", () => {
    expect(TRUE_CALORIMETER_CONSTANT).toBeCloseTo(10200, 6);
  });

  it("calibration with 1.000 g of benzoic acid recovers C_cal", () => {
    const model = new BombCalorimeterModel();
    model.ignite();
    runFor(model, 600);
    expect(deltaT(model)).toBeCloseTo(26434 / 10200, 3);
    expect(calibratedConstant(FUELS.benzoicAcid, 1, deltaT(model))).toBeCloseTo(10.2, 2);
  });

  it("a calibrated bomb measures sucrose: ΔcU = ΔcH = −5644 kJ/mol", () => {
    const model = new BombCalorimeterModel();
    model.modeProperty.value = "measure";
    model.fuelProperty.value = FUELS.sucrose;
    model.ignite();
    runFor(model, 600);
    const result = measure(FUELS.sucrose, 1, deltaT(model), 10.2);
    expect(result.internalEnergy).toBeCloseTo(-5644, -1);
    expect(result.enthalpy).toBeCloseTo(result.internalEnergy, 9);
  });

  it("extrapolation corrects a leaky jacket", () => {
    const model = new BombCalorimeterModel();
    model.idealProperty.value = false;
    model.ignite();
    runFor(model, 900);
    model.extrapolateProperty.value = false;
    const peak = calibratedConstant(FUELS.benzoicAcid, 1, deltaT(model));
    model.extrapolateProperty.value = true;
    const extrapolated = calibratedConstant(FUELS.benzoicAcid, 1, deltaT(model));
    expect(Math.abs(extrapolated / 10.2 - 1)).toBeLessThan(Math.abs(peak / 10.2 - 1));
    expect(Math.abs(extrapolated / 10.2 - 1)).toBeLessThan(0.005);
  });

  it("switching mode starts a new trial", () => {
    const model = new BombCalorimeterModel();
    model.ignite();
    runFor(model, 5);
    model.modeProperty.value = "measure";
    expect(model.phaseProperty.value).toBe("ready");
    expect(model.waterTemperatureProperty.value).toBe(25);
  });
});
