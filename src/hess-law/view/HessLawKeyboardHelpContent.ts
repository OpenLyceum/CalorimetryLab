/**
 * HessLawKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Hess's Law screen: the puzzle menu on the left; the Reverse
 * checkboxes and the multiplier buttons (a radio group per step) on the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class HessLawKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super([new ComboBoxKeyboardHelpSection()], [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })]);
  }
}
