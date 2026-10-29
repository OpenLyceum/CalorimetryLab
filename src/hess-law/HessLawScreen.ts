/**
 * HessLawScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createHessLawIcon() in src/common/CalorimetryLabScreenIcons.ts.
 */
import type { TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import CalorimetryLabColors from "../CalorimetryLabColors.js";
import { createHessLawIcon } from "../common/CalorimetryLabScreenIcons.js";
import { HessLawModel } from "./model/HessLawModel.js";
import { HessLawKeyboardHelpContent } from "./view/HessLawKeyboardHelpContent.js";
import { HessLawScreenView } from "./view/HessLawScreenView.js";

type SelfOptions = {
  /** Preferences: show the worked calculations. */
  showCalculationsProperty: TReadOnlyProperty<boolean>;
};

// Require tandem to be explicit — accidental omission would break PhET-iO.
type HessLawScreenOptions = SelfOptions & ScreenOptions & { tandem: Tandem };

export class HessLawScreen extends Screen<HessLawModel, HessLawScreenView> {
  public constructor(options: HessLawScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new HessLawModel(),
      // View factory — receives the model instance
      (model) =>
        new HessLawScreenView(model, {
          showCalculationsProperty: options.showCalculationsProperty,
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<HessLawScreenOptions, SelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: CalorimetryLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new HessLawKeyboardHelpContent(),
          homeScreenIcon: createHessLawIcon(),
          navigationBarIcon: createHessLawIcon(),
        },
        options,
      ),
    );
  }
}
