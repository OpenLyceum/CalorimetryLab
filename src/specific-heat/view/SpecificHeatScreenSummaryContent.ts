/**
 * SpecificHeatScreenSummaryContent.ts
 *
 * Screen summary for the Specific Heat screen. The current-details paragraph is live: before the
 * drop it gives the sample and water setup, after it both temperatures and the water's heat gain.
 */

import { DerivedProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { fixed } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { SpecificHeatModel } from "../model/SpecificHeatModel.js";

export class SpecificHeatScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: SpecificHeatModel) {
    const a11y = StringManager.getInstance().getSpecificHeatA11yStrings();
    const names = StringManager.getInstance().getSpecificHeatStrings().names;

    // Lives as long as the screen, which is never disposed.
    const currentDetailsProperty = new DerivedProperty(
      [
        model.phaseProperty,
        model.sampleProperty,
        model.sampleMassProperty,
        model.sampleTemperatureProperty,
        model.waterMassProperty,
        model.waterTemperatureProperty,
        model.waterHeatProperty,
        localeProperty,
      ],
      (phase, sample, mass, sampleT, waterMass, waterT, waterHeat) =>
        phase === "ready"
          ? StringUtils.fillIn(a11y.currentDetailsReadyPatternStringProperty.value, {
              sample: names[`${sample.id}StringProperty`].value,
              mass: fixed(mass, 0),
              sampleT: fixed(sampleT, 1),
              waterMass: fixed(waterMass, 0),
              waterT: fixed(waterT, 1),
            })
          : StringUtils.fillIn(a11y.currentDetailsRunningPatternStringProperty.value, {
              sampleT: fixed(sampleT, 2),
              waterT: fixed(waterT, 2),
              q: fixed(waterHeat, 0),
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
