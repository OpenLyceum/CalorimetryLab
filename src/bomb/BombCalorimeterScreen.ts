/**
 * BombCalorimeterScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createBombCalorimeterIcon() in src/common/CalorimetryLabScreenIcons.ts.
 */
import type { TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import CalorimetryLabColors from "../CalorimetryLabColors.js";
import { createBombCalorimeterIcon } from "../common/CalorimetryLabScreenIcons.js";
import { BombCalorimeterModel } from "./model/BombCalorimeterModel.js";
import { BombCalorimeterKeyboardHelpContent } from "./view/BombCalorimeterKeyboardHelpContent.js";
import { BombCalorimeterScreenView } from "./view/BombCalorimeterScreenView.js";

type SelfOptions = {
  /** Preferences: show the worked calculations. */
  showCalculationsProperty: TReadOnlyProperty<boolean>;
};

// Require tandem to be explicit — accidental omission would break PhET-iO.
type BombCalorimeterScreenOptions = SelfOptions & ScreenOptions & { tandem: Tandem };

export class BombCalorimeterScreen extends Screen<BombCalorimeterModel, BombCalorimeterScreenView> {
  public constructor(options: BombCalorimeterScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new BombCalorimeterModel(),
      // View factory — receives the model instance
      (model) =>
        new BombCalorimeterScreenView(model, {
          showCalculationsProperty: options.showCalculationsProperty,
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<BombCalorimeterScreenOptions, SelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: CalorimetryLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new BombCalorimeterKeyboardHelpContent(),
          homeScreenIcon: createBombCalorimeterIcon(),
          navigationBarIcon: createBombCalorimeterIcon(),
        },
        options,
      ),
    );
  }
}
