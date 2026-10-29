/**
 * CoffeeCupScreenSummaryContent.ts
 *
 * Screen summary for the Coffee Cup screen. The current-details paragraph is live: the reaction
 * and starting temperature before mixing, then the temperature, its change and the progress.
 */

import { DerivedProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { fixed } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { CoffeeCupModel } from "../model/CoffeeCupModel.js";

export class CoffeeCupScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: CoffeeCupModel) {
    const a11y = StringManager.getInstance().getCoffeeCupA11yStrings();
    const names = StringManager.getInstance().getCoffeeCupStrings().names;

    // Lives as long as the screen, which is never disposed.
    const currentDetailsProperty = new DerivedProperty(
      [
        model.phaseProperty,
        model.reactionProperty,
        model.temperatureProperty,
        model.initialTemperatureProperty,
        model.progressProperty,
        localeProperty,
      ],
      (phase, reaction, temperature, initial, progress) => {
        const name = names[`${reaction.id}StringProperty`].value;
        return phase === "ready"
          ? StringUtils.fillIn(a11y.currentDetailsReadyPatternStringProperty.value, {
              reaction: name,
              temperature: fixed(initial, 1),
            })
          : StringUtils.fillIn(a11y.currentDetailsRunningPatternStringProperty.value, {
              reaction: name,
              temperature: fixed(temperature, 2),
              deltaT: fixed(temperature - initial, 2),
              progress: fixed(progress * 100, 0),
            });
      },
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
