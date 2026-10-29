/**
 * BombCalorimeterKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Bomb Calorimeter screen: the sample-mass and calorimeter-constant sliders and the time
 * controls on the left; the sample menu, mode buttons, buttons and checkboxes on the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TimeControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class BombCalorimeterKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new SliderControlsKeyboardHelpSection(), new TimeControlsKeyboardHelpSection()],
      [new ComboBoxKeyboardHelpSection(), new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
