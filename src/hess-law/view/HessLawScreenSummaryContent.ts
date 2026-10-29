/**
 * HessLawScreenSummaryContent.ts
 *
 * Screen summary for the Hess's Law screen. The current-details paragraph is live: the target,
 * the net equation of the steps as they stand with its ΔH, and whether that solves the puzzle.
 */

import { DerivedProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatEnthalpy } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { HessLawModel } from "../model/HessLawModel.js";
import { formatEquation } from "../model/ReactionEquation.js";

export class HessLawScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: HessLawModel) {
    const a11y = StringManager.getInstance().getHessLawA11yStrings();
    const strings = StringManager.getInstance().getHessLawStrings();

    // Lives as long as the screen, which is never disposed.
    const currentDetailsProperty = new DerivedProperty(
      [model.puzzleProperty, model.sumProperty, model.solvedProperty, localeProperty],
      (puzzle, sum, solved) =>
        StringUtils.fillIn(a11y.currentDetailsPatternStringProperty.value, {
          target: formatEquation(puzzle.target, true),
          sum: sum.coefficients.size === 0 ? strings.emptyNetStringProperty.value : formatEquation(sum, true),
          value: formatEnthalpy(sum.enthalpy),
          verdict: solved
            ? StringUtils.fillIn(a11y.responses.solvedPatternStringProperty.value, {
                value: formatEnthalpy(sum.enthalpy),
              })
            : strings.notSolvedStringProperty.value,
        }),
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
