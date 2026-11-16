import { CALORIMETRY_LAB_PREFERENCES_NODE_SETTINGS } from "../CalorimetryLabConstants.js";
/**
 * CalorimetryLabPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound
 * to CalorimetryLabPreferencesModel Properties (whose initial values come from
 * calorimetryLabQueryParameters).
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import CalorimetryLabColors from "../CalorimetryLabColors.js";
import CalorimetryLabNamespace from "../CalorimetryLabNamespace.js";
import { StringManager } from "../i18n/StringManager.js";
import type { CalorimetryLabPreferencesModel } from "./CalorimetryLabPreferencesModel.js";

export class CalorimetryLabPreferencesNode extends VBox {
  public constructor(preferencesModel: CalorimetryLabPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    // The Preferences dialog is always white, so use the dark "light control surface"
    // colors (readable on white in both default and projector profiles), not textColorProperty
    // (which is near-white in default mode and would be invisible on the white dialog).
    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: CALORIMETRY_LAB_PREFERENCES_NODE_SETTINGS.HEADER_FONT_SIZE, weight: "bold" }),
      fill: CalorimetryLabColors.controlSurfaceTextColorProperty,
    });

    const showCalculationsCheckbox = new Checkbox(
      preferencesModel.showCalculationsProperty,
      new Text(prefStrings.showCalculationsStringProperty, {
        font: new PhetFont(CALORIMETRY_LAB_PREFERENCES_NODE_SETTINGS.SHOW_CALCULATIONS_CHECKBOX_FONT_SIZE),
        fill: CalorimetryLabColors.controlSurfaceTextColorProperty,
        maxWidth: CALORIMETRY_LAB_PREFERENCES_NODE_SETTINGS.SHOW_CALCULATIONS_CHECKBOX_MAX_WIDTH,
      }),
      {
        checkboxColor: CalorimetryLabColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: CalorimetryLabColors.controlSurfaceColorProperty,
        spacing: CALORIMETRY_LAB_PREFERENCES_NODE_SETTINGS.SHOW_CALCULATIONS_CHECKBOX_SPACING,
        ...(tandem && { tandem: tandem.createTandem("showCalculationsCheckbox") }),
      },
    );

    super({
      align: "left",
      spacing: CALORIMETRY_LAB_PREFERENCES_NODE_SETTINGS.CONSTRUCTOR_SPACING,
      children: [header, showCalculationsCheckbox],
    });
  }
}

CalorimetryLabNamespace.register("CalorimetryLabPreferencesNode", CalorimetryLabPreferencesNode);
