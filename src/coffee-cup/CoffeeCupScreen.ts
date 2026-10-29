/**
 * CoffeeCupScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createCoffeeCupIcon() in src/common/CalorimetryLabScreenIcons.ts.
 */
import type { TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import CalorimetryLabColors from "../CalorimetryLabColors.js";
import { createCoffeeCupIcon } from "../common/CalorimetryLabScreenIcons.js";
import { CoffeeCupModel } from "./model/CoffeeCupModel.js";
import { CoffeeCupKeyboardHelpContent } from "./view/CoffeeCupKeyboardHelpContent.js";
import { CoffeeCupScreenView } from "./view/CoffeeCupScreenView.js";

type SelfOptions = {
  /** Preferences: show the worked calculations. */
  showCalculationsProperty: TReadOnlyProperty<boolean>;
};

// Require tandem to be explicit — accidental omission would break PhET-iO.
type CoffeeCupScreenOptions = SelfOptions & ScreenOptions & { tandem: Tandem };

export class CoffeeCupScreen extends Screen<CoffeeCupModel, CoffeeCupScreenView> {
  public constructor(options: CoffeeCupScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new CoffeeCupModel(),
      // View factory — receives the model instance
      (model) =>
        new CoffeeCupScreenView(model, {
          showCalculationsProperty: options.showCalculationsProperty,
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<CoffeeCupScreenOptions, SelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: CalorimetryLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new CoffeeCupKeyboardHelpContent(),
          homeScreenIcon: createCoffeeCupIcon(),
          navigationBarIcon: createCoffeeCupIcon(),
        },
        options,
      ),
    );
  }
}
