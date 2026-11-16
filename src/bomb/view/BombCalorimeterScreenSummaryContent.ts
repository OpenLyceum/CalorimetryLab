import { BOMB_CALORIMETER_SCREEN_SUMMARY_CONTENT_SETTINGS } from "../../CalorimetryLabConstants.js";
/**
 * BombCalorimeterScreenSummaryContent.ts
 *
 * Screen summary for the Bomb Calorimeter screen. The current-details paragraph is live: the
 * sample ready to burn, then the water temperature and its rise.
 */

import { DerivedProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { BOMB_START_TEMPERATURE } from "../../CalorimetryLabConstants.js";
import { fixed } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { BombCalorimeterModel } from "../model/BombCalorimeterModel.js";

export class BombCalorimeterScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: BombCalorimeterModel) {
    const a11y = StringManager.getInstance().getBombCalorimeterA11yStrings();
    const names = StringManager.getInstance().getBombCalorimeterStrings().names;

    // Lives as long as the screen, which is never disposed.
    const currentDetailsProperty = new DerivedProperty(
      [
        model.phaseProperty,
        model.modeProperty,
        model.fuelProperty,
        model.massProperty,
        model.waterTemperatureProperty,
        localeProperty,
      ],
      (phase, _mode, _fuel, mass, temperature) => {
        const sample = names[`${model.fuel.id}StringProperty`].value;
        return phase === "ready"
          ? StringUtils.fillIn(a11y.currentDetailsReadyPatternStringProperty.value, {
              mass: fixed(mass, BOMB_CALORIMETER_SCREEN_SUMMARY_CONTENT_SETTINGS.CURRENT_DETAILS_PROPERTY_DECIMALS),
              sample,
              temperature: fixed(
                temperature,
                BOMB_CALORIMETER_SCREEN_SUMMARY_CONTENT_SETTINGS.CURRENT_DETAILS_PROPERTY_DECIMALS,
              ),
            })
          : StringUtils.fillIn(a11y.currentDetailsRunningPatternStringProperty.value, {
              sample,
              temperature: fixed(
                temperature,
                BOMB_CALORIMETER_SCREEN_SUMMARY_CONTENT_SETTINGS.CURRENT_DETAILS_PROPERTY_DECIMALS,
              ),
              deltaT: fixed(
                temperature - BOMB_START_TEMPERATURE,
                BOMB_CALORIMETER_SCREEN_SUMMARY_CONTENT_SETTINGS.CURRENT_DETAILS_PROPERTY_DECIMALS,
              ),
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
