/**
 * Bomb.test.ts
 *
 * Calibrating with benzoic acid recovers the hidden calorimeter constant; a calibrated bomb
 * measures ΔcU and, through Δn(gas)·RT, ΔcH. A calibration is only offered once the water has
 * settled, and is saved exactly as calculated.
 */

import { TimeSpeed } from "scenerystack/scenery-phet";
import { describe, expect, it } from "vitest";
import { BombCalorimeterModel, TRUE_CALORIMETER_CONSTANT } from "../../src/bomb/model/BombCalorimeterModel.js";
import { bombDeltaT, calibratedConstant, calibrationResult, measure } from "../../src/bomb/model/bombAnalysis.js";
import { enthalpyFromInternalEnergy, FUELS, heatReleased } from "../../src/bomb/model/Fuels.js";
import { BOMB_DRIFT_START_TIME, EXTRAPOLATION_FIT_DURATION } from "../../src/CalorimetryLabConstants.js";

function runFor(model: BombCalorimeterModel, seconds: number): void {
  for (let t = 0; t < seconds; t += 1) {
    model.run(1);
  }
}

/** Runs in 0.25 s steps until `time` s after ignition. */
function runUntil(model: BombCalorimeterModel, time: number): void {
  while (model.elapsedTimeProperty.value < time - 1e-9) {
    model.run(0.25);
  }
}

/** The C_cal "Use This C_cal" would save now, or null. */
function calibration(model: BombCalorimeterModel): number | null {
  const trial = model.trialProperty.value;
  return trial
    ? calibrationResult(
        trial.fuel,
        trial.mass,
        model.elapsedTimeProperty.value,
        model.peakTemperatureProperty.value,
        model.driftLineProperty.value,
        model.extrapolateProperty.value,
      )
    : null;
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
  for (const ideal of [true, false]) {
    for (const frames of [[0.5], [0.5, 0.37, 0.49, 0.11]]) {
      it(`calibrates with ${ideal ? "an ideal" : "a leaky"} jacket and frame durations ${frames.join(", ")}`, () => {
        const model = new BombCalorimeterModel();
        model.idealProperty.value = ideal;
        model.timeSpeedProperty.value = TimeSpeed.FAST;
        model.ignite();
        let frame = 0;
        while (model.elapsedTimeProperty.value < 800) {
          model.step(frames[frame++ % frames.length] ?? 0.5);
        }
        const line = model.driftLineProperty.value;
        expect(line).not.toBeNull();
        expect(line?.fromTime).toBe(400);
        expect(line?.toTime).toBe(430);
        const result = calibration(model);
        expect(result).not.toBeNull();
        expect(Math.abs((result ?? 0) / 10.2 - 1)).toBeLessThan(0.005);
        while (model.elapsedTimeProperty.value < 3000) {
          model.step(frames[frame++ % frames.length] ?? 0.5);
        }
        expect(model.driftLineProperty.value).toBe(line);
        expect(calibration(model)).toBe(result);
      });
    }
  }

  it("records the complete drift window when one run crosses the calibration boundary", () => {
    const model = new BombCalorimeterModel();
    model.ignite();
    model.run(BOMB_DRIFT_START_TIME + EXTRAPOLATION_FIT_DURATION);
    expect(model.elapsedTimeProperty.value).toBe(430);
    expect(model.burnedProperty.value).toBe(1);
    expect(calibration(model)).toBeCloseTo(TRUE_CALORIMETER_CONSTANT / 1000, 3);
  });

  it("ignores zero, negative, and nonfinite durations", () => {
    const model = new BombCalorimeterModel();
    model.ignite();
    for (const duration of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      model.run(duration);
    }
    expect(model.elapsedTimeProperty.value).toBe(0);
    expect(model.burnedProperty.value).toBe(0);
    expect(model.waterTemperatureProperty.value).toBe(25);
    expect(model.record.traces[0]).toHaveLength(1);
  });

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

  it("a calibration is only offered once the water has collected the heat", () => {
    // Regression: the burn is 99 % done at 7 s, when ΔT gave 66 kJ/°C (clamped to 15 on saving);
    // at 60 s it still gave 12.2 kJ/°C.
    const model = new BombCalorimeterModel();
    model.extrapolateProperty.value = false;
    model.ignite();
    runUntil(model, 7);
    expect(model.burnedProperty.value).toBeGreaterThan(0.99);
    expect(calibratedConstant(FUELS.benzoicAcid, 1, deltaT(model))).toBeGreaterThan(15);
    expect(calibration(model)).toBeNull();
    runUntil(model, 60);
    expect(calibration(model)).toBeNull();
    runUntil(model, BOMB_DRIFT_START_TIME);
    expect(calibration(model)).toBeCloseTo(10.2, 3);
  });

  it("with extrapolation on, a calibration waits for the drift line", () => {
    const model = new BombCalorimeterModel();
    model.ignite();
    runUntil(model, BOMB_DRIFT_START_TIME + EXTRAPOLATION_FIT_DURATION - 1);
    expect(model.driftLineProperty.value).toBeNull();
    expect(calibration(model)).toBeNull();
    runUntil(model, BOMB_DRIFT_START_TIME + EXTRAPOLATION_FIT_DURATION);
    expect(calibration(model)).toBeCloseTo(10.2, 3);
  });

  it("a leaky jacket calibrates through the extrapolation, and the result stays put", () => {
    const model = new BombCalorimeterModel();
    model.idealProperty.value = false;
    model.ignite();
    runUntil(model, BOMB_DRIFT_START_TIME + EXTRAPOLATION_FIT_DURATION);
    const first = calibration(model);
    expect(first).not.toBeNull();
    expect(Math.abs((first ?? 0) / 10.2 - 1)).toBeLessThan(0.005);
    // Long after, with the record thinned twice, the drift line and the result have not moved.
    runUntil(model, 3000);
    expect(calibration(model)).toBe(first);
    // Without the extrapolation the (uncorrected) peak is used once the water has settled.
    model.extrapolateProperty.value = false;
    expect(calibration(model)).toBeCloseTo(calibratedConstant(FUELS.benzoicAcid, 1, deltaT(model)), 12);
  });

  it("saving a calibration keeps the value or refuses it, never clamps it", () => {
    const model = new BombCalorimeterModel();
    expect(model.useCalibration(66.07)).toBe(false);
    expect(model.calorimeterConstantProperty.value).toBe(10);
    expect(model.useCalibration(10.2031)).toBe(true);
    expect(model.calorimeterConstantProperty.value).toBe(10.2031);
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
