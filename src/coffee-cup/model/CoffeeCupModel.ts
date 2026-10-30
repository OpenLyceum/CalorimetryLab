/**
 * CoffeeCupModel.ts
 *
 * A constant-pressure calorimeter: two nested foam cups, a lid, a stirrer and a thermometer. The
 * solution is one thermal body, C = m(solution)·c(water), plus the cup's own heat capacity when
 * the calorimeter is not ideal. After mixing, the reaction runs to completion with first-order
 * kinetics, ξ(t) = ξ_max(1 − e^(−t/τ)), and releases −ΔH per mole into the solution. A non-ideal
 * cup also leaks heat to the room, so its temperature peaks and then drifts; the drift line,
 * extrapolated back to the moment of mixing, recovers the ΔT an instant reaction would give.
 *
 * Mix is refused while `setupProblemProperty` says the setup would leave the liquid range or
 * leave salt undissolved, so every trial stays inside what the model describes.
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
  COFFEE_CUP_TIME_SCALE,
  CUP_HEAT_CAPACITY,
  CUP_ROOM_CONDUCTANCE,
  DISSOLVING_VOLUME_DEFAULT,
  DISSOLVING_VOLUME_RANGE,
  INITIAL_TEMPERATURE_RANGE,
  METAL_MASS_DEFAULT,
  METAL_MASS_RANGE,
  ROOM_TEMPERATURE,
  SOLUTE_MASS_DEFAULT,
  SOLUTE_MASS_RANGE,
  SOLUTION_CONCENTRATION_DEFAULT,
  SOLUTION_CONCENTRATION_RANGE,
  SOLUTION_DENSITY,
  SOLUTION_VOLUME_DEFAULT,
  SOLUTION_VOLUME_RANGE,
  WATER_SPECIFIC_HEAT,
} from "../../CalorimetryLabConstants.js";
import type { ExperimentPhase } from "../../common/model/ExperimentPhase.js";
import { type DriftLine, driftLine } from "../../common/model/extrapolation.js";
import { TemperatureRecord } from "../../common/model/TemperatureRecord.js";
import { ThermalNetwork } from "../../common/model/ThermalNetwork.js";
import { timeScaleFor } from "../../common/model/timeScale.js";
import { TimeModel } from "../../common/TimeModel.js";
import {
  COFFEE_CUP_REACTIONS,
  type CoffeeCupReaction,
  type CoffeeCupSetup,
  driftStartTime,
  reactionExtent,
  type SetupProblem,
  setupProblem,
  solutionMass,
} from "./CoffeeCupReactions.js";

export class CoffeeCupModel implements TModel {
  public readonly reactionProperty = new Property<CoffeeCupReaction>(COFFEE_CUP_REACTIONS.hclNaoh);

  public readonly acidVolumeProperty = new NumberProperty(SOLUTION_VOLUME_DEFAULT, { range: SOLUTION_VOLUME_RANGE });
  public readonly acidConcentrationProperty = new NumberProperty(SOLUTION_CONCENTRATION_DEFAULT, {
    range: SOLUTION_CONCENTRATION_RANGE,
  });
  public readonly baseVolumeProperty = new NumberProperty(SOLUTION_VOLUME_DEFAULT, { range: SOLUTION_VOLUME_RANGE });
  public readonly baseConcentrationProperty = new NumberProperty(SOLUTION_CONCENTRATION_DEFAULT, {
    range: SOLUTION_CONCENTRATION_RANGE,
  });
  public readonly waterVolumeProperty = new NumberProperty(DISSOLVING_VOLUME_DEFAULT, {
    range: DISSOLVING_VOLUME_RANGE,
  });
  public readonly soluteMassProperty = new NumberProperty(SOLUTE_MASS_DEFAULT, { range: SOLUTE_MASS_RANGE });
  public readonly metalMassProperty = new NumberProperty(METAL_MASS_DEFAULT, { range: METAL_MASS_RANGE });
  public readonly initialTemperatureProperty = new NumberProperty(ROOM_TEMPERATURE, {
    range: INITIAL_TEMPERATURE_RANGE,
    units: "°C",
  });

  /** An ideal calorimeter holds no heat itself and loses none to the room. */
  public readonly idealProperty = new BooleanProperty(true);

  /** Use the extrapolated ΔT (when there is one) rather than the peak ΔT. */
  public readonly extrapolateProperty = new BooleanProperty(true);

  public readonly phaseProperty = new Property<ExperimentPhase>("ready");
  public readonly temperatureProperty = new NumberProperty(ROOM_TEMPERATURE, { units: "°C" });

  /** Temperature furthest from the start so far (°C). */
  public readonly peakTemperatureProperty = new NumberProperty(ROOM_TEMPERATURE, { units: "°C" });

  /** Time since mixing (s). */
  public readonly elapsedTimeProperty = new NumberProperty(0, { units: "s" });

  /** Fraction of the reaction completed, 0 to 1. */
  public readonly progressProperty = new NumberProperty(0);

  /** Line through the drift once the reaction is over; null until its window has been recorded. */
  public readonly driftLineProperty = new Property<DriftLine | null>(null);

  /** The trial frozen at mixing (null while setting up). */
  public readonly trialProperty = new Property<CoffeeCupSetup | null>(null);

  public readonly record = new TemperatureRecord(1);

  public readonly timer = new TimeModel(true);
  public readonly timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

  /** Why the current setup cannot be mixed, or null when it can. */
  public readonly setupProblemProperty: TReadOnlyProperty<SetupProblem | null>;

  private network: ThermalNetwork | null = null;

  public constructor() {
    this.setupProblemProperty = DerivedProperty.deriveAny(
      [
        this.reactionProperty,
        this.acidVolumeProperty,
        this.acidConcentrationProperty,
        this.baseVolumeProperty,
        this.baseConcentrationProperty,
        this.waterVolumeProperty,
        this.soluteMassProperty,
        this.metalMassProperty,
        this.initialTemperatureProperty,
      ],
      () => setupProblem(this.setup, this.initialTemperatureProperty.value),
    );
    this.initialTemperatureProperty.link((t) => {
      if (this.phaseProperty.value === "ready") {
        this.temperatureProperty.value = t;
        this.peakTemperatureProperty.value = t;
      }
    });
    this.reactionProperty.lazyLink(() => this.newTrial());
  }

  /** The setup as the controls stand. */
  public get setup(): CoffeeCupSetup {
    return {
      reaction: this.reactionProperty.value,
      acidVolume: this.acidVolumeProperty.value,
      acidConcentration: this.acidConcentrationProperty.value,
      baseVolume: this.baseVolumeProperty.value,
      baseConcentration: this.baseConcentrationProperty.value,
      waterVolume: this.waterVolumeProperty.value,
      soluteMass: this.soluteMassProperty.value,
      metalMass: this.metalMassProperty.value,
    };
  }

  /** Heat capacity of what holds the heat (J/°C): the solution, plus the cup if not ideal. */
  public static heatCapacity(setup: CoffeeCupSetup, ideal: boolean): number {
    return solutionMass(setup, SOLUTION_DENSITY) * WATER_SPECIFIC_HEAT + (ideal ? 0 : CUP_HEAT_CAPACITY);
  }

  /** Mixes the reactants and starts the trial, unless the setup is outside the model. */
  public mix(): void {
    if (this.phaseProperty.value !== "ready" || this.setupProblemProperty.value) {
      return;
    }
    const setup = this.setup;
    this.trialProperty.value = setup;
    const ideal = this.idealProperty.value;
    this.network = new ThermalNetwork(
      [CoffeeCupModel.heatCapacity(setup, ideal)],
      [this.initialTemperatureProperty.value],
      [],
      ROOM_TEMPERATURE,
    );
    this.network.roomConductances[0] = ideal ? 0 : CUP_ROOM_CONDUCTANCE;
    this.elapsedTimeProperty.value = 0;
    this.progressProperty.value = 0;
    this.record.clear();
    this.driftLineProperty.value = null;
    this.phaseProperty.value = "running";
    this.timer.isPlayingProperty.value = true;
    this.update();
  }

  /** Empties the cup and returns to the setup. */
  public newTrial(): void {
    this.network = null;
    this.trialProperty.value = null;
    this.phaseProperty.value = "ready";
    this.elapsedTimeProperty.value = 0;
    this.progressProperty.value = 0;
    this.temperatureProperty.value = this.initialTemperatureProperty.value;
    this.peakTemperatureProperty.value = this.initialTemperatureProperty.value;
    this.driftLineProperty.value = null;
    this.record.clear();
  }

  public reset(): void {
    this.reactionProperty.reset();
    this.acidVolumeProperty.reset();
    this.acidConcentrationProperty.reset();
    this.baseVolumeProperty.reset();
    this.baseConcentrationProperty.reset();
    this.waterVolumeProperty.reset();
    this.soluteMassProperty.reset();
    this.metalMassProperty.reset();
    this.initialTemperatureProperty.reset();
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
    this.run(dt * timeScaleFor(this.timeSpeedProperty.value, COFFEE_CUP_TIME_SCALE));
  }

  /** Runs the trial for `simDt` simulated seconds. */
  public run(simDt: number): void {
    const network = this.network;
    const trial = this.trialProperty.value;
    if (!(network && trial) || simDt <= 0) {
      return;
    }
    const tau = trial.reaction.timeConstant;
    const t0 = this.elapsedTimeProperty.value;
    const t1 = t0 + simDt;
    const progress = 1 - Math.exp(-t1 / tau);
    const reacted = (progress - this.progressProperty.value) * reactionExtent(trial).moles;
    // Heat into the solution (J) = −ΔH (kJ/mol → J/mol) × moles reacted in this step.
    const heat = -trial.reaction.enthalpy * 1000 * reacted;
    network.step(simDt, [heat / simDt]);
    this.progressProperty.value = progress;
    this.elapsedTimeProperty.value = t1;
    this.update();
  }

  private update(): void {
    const temperature = this.network?.temperatures[0];
    const trial = this.trialProperty.value;
    if (temperature === undefined || !trial) {
      return;
    }
    const start = this.initialTemperatureProperty.value;
    this.temperatureProperty.value = temperature;
    if (Math.abs(temperature - start) > Math.abs(this.peakTemperatureProperty.value - start)) {
      this.peakTemperatureProperty.value = temperature;
    }
    this.record.record(this.elapsedTimeProperty.value, [temperature]);
    // Once fitted, the line is a finished measurement: later drift and record thinning leave it be.
    if (!this.driftLineProperty.value) {
      this.driftLineProperty.value = driftLine(this.record.traces[0] ?? [], driftStartTime(trial.reaction));
    }
  }
}
