/**
 * SpecificHeatModel.test.ts
 *
 * Dropping a hot sample into water: the closed-form final temperature, q_sample = −q_water when
 * insulated, and heat lost to the room when not.
 */

import { describe, expect, it } from "vitest";
import { SAMPLES } from "../../src/specific-heat/model/Samples.js";
import { equilibriumTemperature, SpecificHeatModel } from "../../src/specific-heat/model/SpecificHeatModel.js";

function runFor(model: SpecificHeatModel, seconds: number): void {
  // advance() takes real seconds; the default (normal) speed runs 4 s of sim time per second.
  for (let t = 0; t < seconds / 4; t += 0.05) {
    model.advance(0.05);
  }
}

describe("SpecificHeatModel", () => {
  it("follows the setup until the sample is dropped", () => {
    const model = new SpecificHeatModel();
    model.waterInitialTemperatureProperty.value = 25;
    expect(model.waterTemperatureProperty.value).toBe(25);
    runFor(model, 10);
    expect(model.waterTemperatureProperty.value).toBe(25);
    expect(model.phaseProperty.value).toBe("ready");
  });

  it("reaches the closed-form equilibrium: 50 g Cu at 100 °C into 100 g water at 20 °C → 23.52 °C", () => {
    const model = new SpecificHeatModel();
    model.drop();
    runFor(model, 300);
    const expected = equilibriumTemperature(50 * 0.385, 100, 100 * 4.184, 20);
    expect(expected).toBeCloseTo(23.52, 2);
    expect(model.waterTemperatureProperty.value).toBeCloseTo(expected, 3);
    expect(model.sampleTemperatureProperty.value).toBeCloseTo(expected, 3);
  });

  it("keeps q(sample) = −q(water) at every moment when insulated", () => {
    const model = new SpecificHeatModel();
    model.sampleProperty.value = SAMPLES.aluminum;
    model.sampleMassProperty.value = 120;
    model.drop();
    for (const seconds of [2, 10, 60]) {
      runFor(model, seconds);
      expect(model.sampleHeatProperty.value).toBeCloseTo(-model.waterHeatProperty.value, 6);
    }
  });

  it("recovers an unknown's specific heat from the data", () => {
    const model = new SpecificHeatModel();
    model.sampleProperty.value = SAMPLES.unknownA;
    model.drop();
    runFor(model, 400);
    const sampleDeltaT = model.sampleTemperatureProperty.value - model.sampleInitialTemperatureProperty.value;
    const c = -model.waterHeatProperty.value / (model.sampleMassProperty.value * sampleDeltaT);
    expect(c).toBeCloseTo(0.523, 3);
  });

  it("loses heat to the room when the cup is not insulated", () => {
    const model = new SpecificHeatModel();
    model.insulatedProperty.value = false;
    model.drop();
    runFor(model, 600);
    // The water ends below the insulated equilibrium, drifting toward the 22 °C room.
    expect(model.waterTemperatureProperty.value).toBeLessThan(23.4);
    expect(model.sampleHeatProperty.value + model.waterHeatProperty.value).toBeLessThan(-10);
  });

  it("returns to the setup on New Trial", () => {
    const model = new SpecificHeatModel();
    model.drop();
    runFor(model, 30);
    model.newTrial();
    expect(model.phaseProperty.value).toBe("ready");
    expect(model.sampleTemperatureProperty.value).toBe(100);
    expect(model.record.traces[0]).toHaveLength(0);
  });
});
