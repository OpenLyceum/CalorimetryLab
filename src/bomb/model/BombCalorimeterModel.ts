/**
 * BombCalorimeterModel.ts
 *
 * A constant-volume calorimeter: a steel bomb full of oxygen sits in a bucket of 2000 g of water.
 * Two thermal bodies, the bomb hardware (bomb, bucket, stirrer, thermometer) and the water, are
 * joined by a conductance; the sample burns inside the bomb in a second or two, and the heat then
 * spreads into the water over about a minute. Their combined heat capacity is the calorimeter
 * constant C_cal, which the student never sees: they find it by burning benzoic acid
 * (Calibrate), then use their value to measure other samples (Measure). A real jacket also leaks
 * a little heat to the room, which the drift-line extrapolation corrects.
 */

import { BooleanProperty, EnumerationProperty, NumberProperty, Property } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { TimeSpeed } from "scenerystack/scenery-phet";
import {
  BOMB_HARDWARE_HEAT_CAPACITY,
  BOMB_START_TEMPERATURE,
  BOMB_TIME_SCALE,
  BOMB_WATER_CONDUCTANCE,
  BUCKET_WATER_MASS,
  BURN_TIME_CONSTANT,
  CALORIMETER_CONSTANT_DEFAULT,
  CALORIMETER_CONSTANT_RANGE,
  JACKET_CONDUCTANCE,
  PELLET_MASS_DEFAULT,
  PELLET_MASS_RANGE,
  WATER_SPECIFIC_HEAT,
} from "../../CalorimetryLabConstants.js";
import type { ExperimentPhase } from "../../common/model/ExperimentPhase.js";
import { type DriftLine, driftLine } from "../../common/model/extrapolation.js";
import { TemperatureRecord } from "../../common/model/TemperatureRecord.js";
import { ThermalNetwork } from "../../common/model/ThermalNetwork.js";
import { timeScaleFor } from "../../common/model/timeScale.js";
import { TimeModel } from "../../common/TimeModel.js";
import { FUELS, type Fuel, heatReleased } from "./Fuels.js";

export type BombMode = "calibrate" | "measure";

const BOMB_BODY = 0;
const WATER_BODY = 1;

/** The true calorimeter constant (J/°C): bucket water plus hardware. */
export const TRUE_CALORIMETER_CONSTANT = BUCKET_WATER_MASS * WATER_SPECIFIC_HEAT + BOMB_HARDWARE_HEAT_CAPACITY;

export class BombCalorimeterModel implements TModel {
  public readonly modeProperty = new Property<BombMode>("calibrate");

  /** The Measure mode's sample; Calibrate always burns benzoic acid. */
  public readonly fuelProperty = new Property<Fuel>(FUELS.sucrose);
  public readonly massProperty = new NumberProperty(PELLET_MASS_DEFAULT, { range: PELLET_MASS_RANGE, units: "g" });

  /** The calorimeter constant the student uses in Measure (kJ/°C). */
  public readonly calorimeterConstantProperty = new NumberProperty(CALORIMETER_CONSTANT_DEFAULT, {
    range: CALORIMETER_CONSTANT_RANGE,
  });

  /** An ideal (adiabatic) jacket loses no heat to the room. */
  public readonly idealProperty = new BooleanProperty(true);
  public readonly extrapolateProperty = new BooleanProperty(true);

  public readonly phaseProperty = new Property<ExperimentPhase>("ready");
  public readonly waterTemperatureProperty = new NumberProperty(BOMB_START_TEMPERATURE, { units: "°C" });
  public readonly bombTemperatureProperty = new NumberProperty(BOMB_START_TEMPERATURE, { units: "°C" });
  public readonly peakTemperatureProperty = new NumberProperty(BOMB_START_TEMPERATURE, { units: "°C" });

  /** Time since ignition (s). */
  public readonly elapsedTimeProperty = new NumberProperty(0, { units: "s" });

  /** Fraction of the sample burned, 0 to 1. */
  public readonly burnedProperty = new NumberProperty(0);

  public readonly driftLineProperty = new Property<DriftLine | null>(null);

  /** The sample and mass burned in this trial (null while setting up). */
  public readonly trialProperty = new Property<{ readonly fuel: Fuel; readonly mass: number } | null>(null);

  /** Trace: [water]. */
  public readonly record = new TemperatureRecord(1);

  public readonly timer = new TimeModel(true);
  public readonly timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

  private network: ThermalNetwork | null = null;

  public constructor() {
    this.modeProperty.lazyLink(() => this.newTrial());
  }

  /** The sample the next ignition burns. */
  public get fuel(): Fuel {
    return this.modeProperty.value === "calibrate" ? FUELS.benzoicAcid : this.fuelProperty.value;
  }

  /** Fires the sample. */
  public ignite(): void {
    if (this.phaseProperty.value !== "ready") {
      return;
    }
    this.trialProperty.value = { fuel: this.fuel, mass: this.massProperty.value };
    this.network = new ThermalNetwork(
      [BOMB_HARDWARE_HEAT_CAPACITY, BUCKET_WATER_MASS * WATER_SPECIFIC_HEAT],
      [BOMB_START_TEMPERATURE, BOMB_START_TEMPERATURE],
      [{ a: BOMB_BODY, b: WATER_BODY, conductance: BOMB_WATER_CONDUCTANCE }],
      BOMB_START_TEMPERATURE,
    );
    this.network.roomConductances[WATER_BODY] = this.idealProperty.value ? 0 : JACKET_CONDUCTANCE;
    this.elapsedTimeProperty.value = 0;
    this.burnedProperty.value = 0;
    this.record.clear();
    this.driftLineProperty.value = null;
    this.phaseProperty.value = "running";
    this.timer.isPlayingProperty.value = true;
    this.update();
  }

  /** Puts a fresh sample in a clean bomb, with the water back at the start temperature. */
  public newTrial(): void {
    this.network = null;
    this.trialProperty.value = null;
    this.phaseProperty.value = "ready";
    this.elapsedTimeProperty.value = 0;
    this.burnedProperty.value = 0;
    this.waterTemperatureProperty.value = BOMB_START_TEMPERATURE;
    this.bombTemperatureProperty.value = BOMB_START_TEMPERATURE;
    this.peakTemperatureProperty.value = BOMB_START_TEMPERATURE;
    this.driftLineProperty.value = null;
    this.record.clear();
  }

  /** Carries a calibration result (kJ/°C) over to the Measure mode. */
  public useCalibration(calorimeterConstant: number): void {
    this.calorimeterConstantProperty.value = CALORIMETER_CONSTANT_RANGE.constrainValue(calorimeterConstant);
  }

  public reset(): void {
    this.modeProperty.reset();
    this.fuelProperty.reset();
    this.massProperty.reset();
    this.calorimeterConstantProperty.reset();
    this.idealProperty.reset();
    this.extrapolateProperty.reset();
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
    this.run(dt * timeScaleFor(this.timeSpeedProperty.value, BOMB_TIME_SCALE));
  }

  /** Runs the trial for `simDt` simulated seconds. */
  public run(simDt: number): void {
    const network = this.network;
    const trial = this.trialProperty.value;
    if (!(network && trial) || simDt <= 0) {
      return;
    }
    const t1 = this.elapsedTimeProperty.value + simDt;
    const burned = 1 - Math.exp(-t1 / BURN_TIME_CONSTANT);
    const heat = (burned - this.burnedProperty.value) * heatReleased(trial.fuel, trial.mass);
    network.step(simDt, [heat / simDt, 0]);
    this.burnedProperty.value = burned;
    this.elapsedTimeProperty.value = t1;
    this.update();
  }

  private update(): void {
    const network = this.network;
    if (!network) {
      return;
    }
    const [bomb = 0, water = 0] = network.temperatures;
    this.bombTemperatureProperty.value = bomb;
    this.waterTemperatureProperty.value = water;
    if (
      Math.abs(water - BOMB_START_TEMPERATURE) > Math.abs(this.peakTemperatureProperty.value - BOMB_START_TEMPERATURE)
    ) {
      this.peakTemperatureProperty.value = water;
    }
    this.record.record(this.elapsedTimeProperty.value, [water]);
    this.driftLineProperty.value = driftLine(this.record.traces[0] ?? [], BOMB_START_TEMPERATURE);
  }
}
