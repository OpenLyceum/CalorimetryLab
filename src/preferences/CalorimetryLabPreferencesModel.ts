/**
 * CalorimetryLabPreferencesModel.ts
 *
 * Model for the simulation-specific preferences shown in Preferences →
 * Simulation. Each preference Property takes its initial value from the
 * corresponding query parameter in calorimetryLabQueryParameters.
 */

import { BooleanProperty } from "scenerystack/axon";
import type { Tandem } from "scenerystack/tandem";
import CalorimetryLabNamespace from "../CalorimetryLabNamespace.js";
import calorimetryLabQueryParameters from "./calorimetryLabQueryParameters.js";

export class CalorimetryLabPreferencesModel {
  /**
   * Show the worked calculations (with a checkbox on each screen to hide them). Off hides both,
   * so students have to work ΔH out from the data themselves. From the `calculations` query
   * parameter.
   */
  public readonly showCalculationsProperty: BooleanProperty;

  public constructor(tandem?: Tandem) {
    this.showCalculationsProperty = new BooleanProperty(
      calorimetryLabQueryParameters.calculations,
      tandem ? { tandem: tandem.createTandem("showCalculationsProperty") } : undefined,
    );
  }

  public reset(): void {
    this.showCalculationsProperty.reset();
  }
}

CalorimetryLabNamespace.register("CalorimetryLabPreferencesModel", CalorimetryLabPreferencesModel);
