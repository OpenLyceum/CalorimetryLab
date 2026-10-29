/**
 * SpecificHeatScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createSpecificHeatIcon() in src/common/CalorimetryLabScreenIcons.ts.
 */
import type { TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import CalorimetryLabColors from "../CalorimetryLabColors.js";
import { createSpecificHeatIcon } from "../common/CalorimetryLabScreenIcons.js";
import { SpecificHeatModel } from "./model/SpecificHeatModel.js";
import { SpecificHeatKeyboardHelpContent } from "./view/SpecificHeatKeyboardHelpContent.js";
import { SpecificHeatScreenView } from "./view/SpecificHeatScreenView.js";

type SelfOptions = {
  /** Preferences: show the worked calculations. */
  showCalculationsProperty: TReadOnlyProperty<boolean>;
};

// Require tandem to be explicit — accidental omission would break PhET-iO.
type SpecificHeatScreenOptions = SelfOptions & ScreenOptions & { tandem: Tandem };

export class SpecificHeatScreen extends Screen<SpecificHeatModel, SpecificHeatScreenView> {
  public constructor(options: SpecificHeatScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new SpecificHeatModel(),
      // View factory — receives the model instance
      (model) =>
        new SpecificHeatScreenView(model, {
          showCalculationsProperty: options.showCalculationsProperty,
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<SpecificHeatScreenOptions, SelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: CalorimetryLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new SpecificHeatKeyboardHelpContent(),
          homeScreenIcon: createSpecificHeatIcon(),
          navigationBarIcon: createSpecificHeatIcon(),
        },
        options,
      ),
    );
  }
}
