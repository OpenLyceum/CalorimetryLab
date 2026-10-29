/**
 * SpecificHeatModel.ts
 *
 * A sample heated in a water bath is dropped into water in a cup. Two thermal bodies, the sample
 * (C = m·c of the sample) and the water (C = m·4.184 J/(g·°C); the ideal cup holds no heat), are
 * joined by a conductance that grows with the sample's surface area. With the cup insulated the
 * heat the sample loses is exactly the heat the water gains; without it the water also leaks heat
 * to the room.
 *
 * Until the sample is dropped the temperatures follow the setup sliders; dropping freezes the
 * setup, starts the clock and the temperature record.
 */

import {
  BooleanProperty,
  DerivedProperty,
  EnumerationProperty,
  NumberProperty,
  Property,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { TimeSpeed } from "scenerystack/scenery-phet";
import {
  CUP_ROOM_CONDUCTANCE,
  ROOM_TEMPERATURE,
  SAMPLE_CONDUCTANCE,
  SAMPLE_MASS_DEFAULT,
  SAMPLE_MASS_RANGE,
  SAMPLE_REFERENCE_MASS,
  SAMPLE_TEMPERATURE_DEFAULT,
  SAMPLE_TEMPERATURE_RANGE,
  SPECIFIC_HEAT_TIME_SCALE,
  WATER_MASS_DEFAULT,
  WATER_MASS_RANGE,
  WATER_SPECIFIC_HEAT,
  WATER_TEMPERATURE_DEFAULT,
  WATER_TEMPERATURE_RANGE,
} from "../../CalorimetryLabConstants.js";
import type { ExperimentPhase } from "../../common/model/ExperimentPhase.js";
import { TemperatureRecord } from "../../common/model/TemperatureRecord.js";
import { ThermalNetwork } from "../../common/model/ThermalNetwork.js";
import { timeScaleFor } from "../../common/model/timeScale.js";
import { TimeModel } from "../../common/TimeModel.js";
import { SAMPLES, type Sample } from "./Samples.js";

/** Index of each body in the thermal network and of each trace in the record. */
export const SAMPLE_BODY = 0;
export const WATER_BODY = 1;

/** Sample-to-water conductance (W/°C) for a sample of the given mass (g). */
export function sampleConductance(mass: number): number {
  return SAMPLE_CONDUCTANCE * (mass / SAMPLE_REFERENCE_MASS) ** (2 / 3);
}

/** Final temperature of two bodies that only exchange heat with each other (°C). */
export function equilibriumTemperature(c1: number, t1: number, c2: number, t2: number): number {
  return (c1 * t1 + c2 * t2) / (c1 + c2);
}

export class SpecificHeatModel implements TModel {
  public readonly sampleProperty = new Property<Sample>(SAMPLES.copper);
  public readonly sampleMassProperty = new NumberProperty(SAMPLE_MASS_DEFAULT, {
    range: SAMPLE_MASS_RANGE,
    units: "g",
  });
  public readonly sampleInitialTemperatureProperty = new NumberProperty(SAMPLE_TEMPERATURE_DEFAULT, {
    range: SAMPLE_TEMPERATURE_RANGE,
    units: "°C",
  });
  public readonly waterMassProperty = new NumberProperty(WATER_MASS_DEFAULT, { range: WATER_MASS_RANGE, units: "g" });
  public readonly waterInitialTemperatureProperty = new NumberProperty(WATER_TEMPERATURE_DEFAULT, {
    range: WATER_TEMPERATURE_RANGE,
    units: "°C",
  });
  public readonly insulatedProperty = new BooleanProperty(true);

  /** Show the unknown sample's name. */
  public readonly revealProperty = new BooleanProperty(false);

  public readonly phaseProperty = new Property<ExperimentPhase>("ready");
  public readonly sampleTemperatureProperty = new NumberProperty(SAMPLE_TEMPERATURE_DEFAULT, { units: "°C" });
  public readonly waterTemperatureProperty = new NumberProperty(WATER_TEMPERATURE_DEFAULT, { units: "°C" });

  /** Time since the sample was dropped (s). */
  public readonly elapsedTimeProperty = new NumberProperty(0, { units: "s" });

  /** Rate of heat flow from the sample to the water (W). */
  public readonly heatFlowProperty = new NumberProperty(0, { units: "W" });

  /** Traces: [sample, water]. */
  public readonly record = new TemperatureRecord(2);

  public readonly timer = new TimeModel(true);
  public readonly timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

  /** Heat gained by the water so far, q = m c ΔT (J). */
  public readonly waterHeatProperty: TReadOnlyProperty<number>;

  /** Heat gained by the sample so far, q = m c ΔT (J); negative as it cools. */
  public readonly sampleHeatProperty: TReadOnlyProperty<number>;

  private network: ThermalNetwork | null = null;

  public constructor() {
    this.waterHeatProperty = new DerivedProperty(
      [this.waterMassProperty, this.waterTemperatureProperty, this.waterInitialTemperatureProperty],
      (mass, temperature, initial) => mass * WATER_SPECIFIC_HEAT * (temperature - initial),
    );
    this.sampleHeatProperty = new DerivedProperty(
      [
        this.sampleProperty,
        this.sampleMassProperty,
        this.sampleTemperatureProperty,
        this.sampleInitialTemperatureProperty,
      ],
      (sample, mass, temperature, initial) => mass * sample.specificHeat * (temperature - initial),
    );

    // Before the drop the temperatures are the setup values.
    this.sampleInitialTemperatureProperty.link((t) => {
      if (this.phaseProperty.value === "ready") {
        this.sampleTemperatureProperty.value = t;
      }
    });
    this.waterInitialTemperatureProperty.link((t) => {
      if (this.phaseProperty.value === "ready") {
        this.waterTemperatureProperty.value = t;
      }
    });
    this.insulatedProperty.link((insulated) => {
      if (this.network) {
        this.network.roomConductances[WATER_BODY] = insulated ? 0 : CUP_ROOM_CONDUCTANCE;
      }
    });
  }

  /** Drops the hot sample into the water and starts the trial. */
  public drop(): void {
    if (this.phaseProperty.value !== "ready") {
      return;
    }
    const sample = this.sampleProperty.value;
    const sampleMass = this.sampleMassProperty.value;
    this.network = new ThermalNetwork(
      [sampleMass * sample.specificHeat, this.waterMassProperty.value * WATER_SPECIFIC_HEAT],
      [this.sampleInitialTemperatureProperty.value, this.waterInitialTemperatureProperty.value],
      [{ a: SAMPLE_BODY, b: WATER_BODY, conductance: sampleConductance(sampleMass) }],
      ROOM_TEMPERATURE,
    );
    this.network.roomConductances[WATER_BODY] = this.insulatedProperty.value ? 0 : CUP_ROOM_CONDUCTANCE;
    this.elapsedTimeProperty.value = 0;
    this.record.clear();
    this.phaseProperty.value = "running";
    this.timer.isPlayingProperty.value = true;
    this.update();
  }

  /** Takes the sample out and returns everything to the setup values. */
  public newTrial(): void {
    this.network = null;
    this.phaseProperty.value = "ready";
    this.elapsedTimeProperty.value = 0;
    this.heatFlowProperty.value = 0;
    this.sampleTemperatureProperty.value = this.sampleInitialTemperatureProperty.value;
    this.waterTemperatureProperty.value = this.waterInitialTemperatureProperty.value;
    this.record.clear();
  }

  public reset(): void {
    this.sampleProperty.reset();
    this.sampleMassProperty.reset();
    this.sampleInitialTemperatureProperty.reset();
    this.waterMassProperty.reset();
    this.waterInitialTemperatureProperty.reset();
    this.insulatedProperty.reset();
    this.revealProperty.reset();
    this.timer.reset();
    this.timeSpeedProperty.reset();
    this.newTrial();
  }

  public step(dt: number): void {
    if (this.timer.isPlayingProperty.value) {
      this.advance(dt);
    }
  }

  /** Advances by `dt` real seconds at the chosen speed, playing or not (step button). */
  public advance(dt: number): void {
    if (!this.network) {
      return;
    }
    const simDt = dt * timeScaleFor(this.timeSpeedProperty.value, SPECIFIC_HEAT_TIME_SCALE);
    this.network.step(simDt);
    this.elapsedTimeProperty.value += simDt;
    this.update();
  }

  private update(): void {
    const network = this.network;
    if (!network) {
      return;
    }
    const [sampleTemperature = 0, waterTemperature = 0] = network.temperatures;
    this.sampleTemperatureProperty.value = sampleTemperature;
    this.waterTemperatureProperty.value = waterTemperature;
    this.heatFlowProperty.value = network.heatFlow(SAMPLE_BODY, WATER_BODY);
    this.record.record(this.elapsedTimeProperty.value, [sampleTemperature, waterTemperature]);
  }
}
