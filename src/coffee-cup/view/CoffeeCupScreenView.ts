/**
 * CoffeeCupScreenView.ts
 *
 * Coffee Cup screen layout: the calorimeter and its reactants on the left with the amount
 * controls under them, the temperature chart and the ΔH calculation in the middle, and the
 * reaction menu, calorimeter options, trial buttons and time controls on the right.
 */

import { BooleanProperty, DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import CalorimetryLabColors from "../../CalorimetryLabColors.js";
import {
  CUP_HEAT_CAPACITY,
  PANEL_SPACING,
  SCREEN_VIEW_MARGIN,
  SIDE_COLUMN_WIDTH,
} from "../../CalorimetryLabConstants.js";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/CalorimetryLabButtonOptions.js";
import { CalorimetryLabPanel } from "../../common/CalorimetryLabPanel.js";
import { checkbox, comboBox, heading, numberControl, pushButton } from "../../common/view/ControlFactory.js";
import { createTimeControl } from "../../common/view/createTimeControl.js";
import { fixed, formatEnthalpy, formatJoules, formatMoles, percentError } from "../../common/view/formatValues.js";
import { RichTextLines } from "../../common/view/RichTextLines.js";
import { TemperatureChartNode } from "../../common/view/TemperatureChartNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { CoffeeCupModel } from "../model/CoffeeCupModel.js";
import { COFFEE_CUP_REACTION_LIST, type ReactionKind } from "../model/CoffeeCupReactions.js";
import { analyzeCoffeeCup } from "../model/coffeeCupAnalysis.js";
import { CoffeeCupApparatusNode } from "./CoffeeCupApparatusNode.js";
import { CoffeeCupScreenSummaryContent } from "./CoffeeCupScreenSummaryContent.js";

type SelfOptions = {
  /** Preferences: show the worked calculation at all. */
  showCalculationsProperty: TReadOnlyProperty<boolean>;
};

export type CoffeeCupScreenViewOptions = SelfOptions & ScreenViewOptions;

const LEFT_COLUMN_WIDTH = 318;
const LEFT_CONTENT_WIDTH = LEFT_COLUMN_WIDTH - 24;
const CHART_LEFT = 404;
const CHART_TOP = 44;
const CHART_WIDTH = 344;
const CHART_HEIGHT = 180;
const CALCULATION_LEFT = 350;
const CALCULATION_WIDTH = 404;
const SIDE_CONTENT_WIDTH = SIDE_COLUMN_WIDTH - 24;

export class CoffeeCupScreenView extends ScreenView {
  private readonly apparatus: CoffeeCupApparatusNode;
  private readonly showCalculationProperty = new BooleanProperty(true);

  public constructor(model: CoffeeCupModel, providedOptions: CoffeeCupScreenViewOptions) {
    const options = optionize<CoffeeCupScreenViewOptions, SelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new CoffeeCupScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const strings = StringManager.getInstance().getCoffeeCupStrings();
    const common = StringManager.getInstance().getCommonStrings();
    const a11y = StringManager.getInstance().getCoffeeCupA11yStrings();
    const listParent = new Node();
    const readyProperty = new DerivedProperty([model.phaseProperty], (phase) => phase === "ready");
    const runningProperty = new DerivedProperty([model.phaseProperty], (phase) => phase === "running");
    const kindIs = (...kinds: ReactionKind[]) =>
      new DerivedProperty([model.reactionProperty], (reaction) => kinds.includes(reaction.kind));

    // ── Apparatus and amounts ───────────────────────────────────────────────────
    this.apparatus = new CoffeeCupApparatusNode(model);
    this.apparatus.left = SCREEN_VIEW_MARGIN + 10;
    this.apparatus.top = SCREEN_VIEW_MARGIN;

    const control = (
      title: TReadOnlyProperty<string>,
      property: typeof model.acidVolumeProperty,
      delta: number,
      decimalPlaces: number,
      valuePattern: TReadOnlyProperty<string>,
      kinds: ReactionKind[],
    ) => {
      const node = numberControl(
        title,
        property,
        property.range,
        { delta, decimalPlaces, valuePattern },
        LEFT_CONTENT_WIDTH,
      );
      node.enabledProperty = readyProperty;
      node.visibleProperty = kindIs(...kinds);
      return node;
    };
    const acidVolumeControl = control(
      strings.acidVolumeStringProperty,
      model.acidVolumeProperty,
      1,
      0,
      common.millilitersPatternStringProperty,
      ["neutralization", "metalAcid"],
    );
    const acidConcentrationControl = control(
      strings.acidConcentrationStringProperty,
      model.acidConcentrationProperty,
      0.05,
      2,
      common.molarPatternStringProperty,
      ["neutralization", "metalAcid"],
    );
    const baseVolumeControl = control(
      strings.baseVolumeStringProperty,
      model.baseVolumeProperty,
      1,
      0,
      common.millilitersPatternStringProperty,
      ["neutralization"],
    );
    const baseConcentrationControl = control(
      strings.baseConcentrationStringProperty,
      model.baseConcentrationProperty,
      0.05,
      2,
      common.molarPatternStringProperty,
      ["neutralization"],
    );
    const waterVolumeControl = control(
      strings.waterVolumeStringProperty,
      model.waterVolumeProperty,
      1,
      0,
      common.millilitersPatternStringProperty,
      ["dissolution"],
    );
    const soluteMassControl = control(
      strings.soluteMassStringProperty,
      model.soluteMassProperty,
      0.05,
      2,
      common.gramsPatternStringProperty,
      ["dissolution"],
    );
    const metalMassControl = control(
      strings.metalMassStringProperty,
      model.metalMassProperty,
      0.01,
      2,
      common.gramsPatternStringProperty,
      ["metalAcid"],
    );
    const amountControls = [
      acidVolumeControl,
      acidConcentrationControl,
      baseVolumeControl,
      baseConcentrationControl,
      waterVolumeControl,
      soluteMassControl,
      metalMassControl,
    ];
    const amountsPanel = new CalorimetryLabPanel(new VBox({ align: "left", spacing: 8, children: amountControls }), {
      minWidth: LEFT_COLUMN_WIDTH,
      maxWidth: LEFT_COLUMN_WIDTH,
    });
    amountsPanel.left = SCREEN_VIEW_MARGIN;
    amountsPanel.top = this.apparatus.bottom + 14;

    // ── Chart ───────────────────────────────────────────────────────────────────
    const chart = new TemperatureChartNode(
      model.record,
      [{ color: CalorimetryLabColors.waterTraceColorProperty, label: common.solutionStringProperty }],
      CHART_WIDTH,
      CHART_HEIGHT,
      {
        minSpan: 2,
        referenceTemperatureProperties: [model.initialTemperatureProperty],
        driftLineProperty: model.driftLineProperty,
        showExtrapolationProperty: model.extrapolateProperty,
      },
    );
    chart.x = CHART_LEFT;
    chart.y = CHART_TOP;

    // ── Calculation ─────────────────────────────────────────────────────────────
    const lines = new RichTextLines(10, CALCULATION_WIDTH - 24);
    Multilink.multilinkAny(
      [
        model.phaseProperty,
        model.temperatureProperty,
        model.peakTemperatureProperty,
        model.driftLineProperty,
        model.extrapolateProperty,
        model.idealProperty,
        common.startPromptStringProperty,
        common.deltaTPeakPatternStringProperty,
        common.deltaTExtrapolatedPatternStringProperty,
        common.waitingForDriftStringProperty,
        common.acceptedPatternStringProperty,
        common.exothermicStringProperty,
        common.endothermicStringProperty,
        strings.solutionHeatPatternStringProperty,
        strings.cupHeatPatternStringProperty,
        strings.reactionHeatPatternStringProperty,
        strings.reactionHeatIdealPatternStringProperty,
        strings.molesPatternStringProperty,
        strings.enthalpyPatternStringProperty,
        strings.limitingAcidStringProperty,
      ],
      () => {
        const trial = model.trialProperty.value;
        if (model.phaseProperty.value === "ready" || !trial) {
          lines.setLines([common.startPromptStringProperty.value]);
          return;
        }
        const ideal = model.idealProperty.value;
        const start = model.initialTemperatureProperty.value;
        const result = analyzeCoffeeCup(
          trial,
          // The cup's ideality is fixed when the trial starts.
          ideal,
          start,
          model.peakTemperatureProperty.value,
          model.driftLineProperty.value,
          model.extrapolateProperty.value,
        );
        const limiting = {
          acid: strings.limitingAcidStringProperty,
          base: strings.limitingBaseStringProperty,
          metal: strings.limitingMetalStringProperty,
          both: strings.limitingBothStringProperty,
          solid: strings.limitingSolidStringProperty,
        }[result.limiting].value;
        const deltaTPattern = result.extrapolated
          ? common.deltaTExtrapolatedPatternStringProperty
          : common.deltaTPeakPatternStringProperty;
        const texts = [
          trial.reaction.equation,
          StringUtils.fillIn(deltaTPattern.value, {
            final: fixed(start + result.deltaT, 2),
            initial: fixed(start, 2),
            value: fixed(result.deltaT, 2),
          }),
          StringUtils.fillIn(strings.solutionHeatPatternStringProperty.value, {
            mass: fixed(result.solutionMass, 1),
            deltaT: fixed(result.deltaT, 2),
            q: formatJoules(result.solutionHeat),
          }),
          ideal
            ? ""
            : StringUtils.fillIn(strings.cupHeatPatternStringProperty.value, {
                capacity: CUP_HEAT_CAPACITY,
                deltaT: fixed(result.deltaT, 2),
                q: formatJoules(result.cupHeat),
              }),
          StringUtils.fillIn(
            (ideal ? strings.reactionHeatIdealPatternStringProperty : strings.reactionHeatPatternStringProperty).value,
            { q: formatJoules(result.reactionHeat) },
          ),
          StringUtils.fillIn(strings.molesPatternStringProperty.value, {
            value: formatMoles(result.moles),
            species: trial.reaction.perMoleOf,
            limiting,
          }),
          StringUtils.fillIn(strings.enthalpyPatternStringProperty.value, { value: formatEnthalpy(result.enthalpy) }),
          StringUtils.fillIn(common.acceptedPatternStringProperty.value, {
            value: formatEnthalpy(trial.reaction.enthalpy),
            error: percentError(result.enthalpy, trial.reaction.enthalpy),
          }),
          trial.reaction.enthalpy < 0 ? common.exothermicStringProperty.value : common.endothermicStringProperty.value,
          model.extrapolateProperty.value && !result.extrapolated ? common.waitingForDriftStringProperty.value : "",
        ];
        const close = Math.abs(result.enthalpy / trial.reaction.enthalpy - 1) < 0.02;
        lines.setLines(texts, [
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          CalorimetryLabColors.targetColorProperty,
          close ? CalorimetryLabColors.goodColorProperty : CalorimetryLabColors.poorColorProperty,
          CalorimetryLabColors.mutedTextColorProperty,
          CalorimetryLabColors.mutedTextColorProperty,
        ]);
      },
    );
    const calculationVisibleProperty = DerivedProperty.and([
      options.showCalculationsProperty,
      this.showCalculationProperty,
    ]);
    const calculationPanel = new CalorimetryLabPanel(
      new VBox({ align: "left", spacing: 6, children: [heading(common.calculationHeadingStringProperty, 200), lines] }),
      { minWidth: CALCULATION_WIDTH, maxWidth: CALCULATION_WIDTH, visibleProperty: calculationVisibleProperty },
    );
    calculationPanel.left = CALCULATION_LEFT;
    calculationPanel.top = CHART_TOP + CHART_HEIGHT + 54;

    // ── Reaction and calorimeter controls ──────────────────────────────────────
    const reactionMenu = comboBox(
      model.reactionProperty,
      COFFEE_CUP_REACTION_LIST.map((reaction) => ({
        value: reaction,
        label: strings.names[`${reaction.id}StringProperty`],
      })),
      listParent,
      strings.reactionHeadingStringProperty,
      SIDE_CONTENT_WIDTH,
    );
    reactionMenu.enabledProperty = readyProperty;
    const temperatureControl = numberControl(
      strings.initialTemperatureStringProperty,
      model.initialTemperatureProperty,
      model.initialTemperatureProperty.range,
      { delta: 0.5, decimalPlaces: 1, valuePattern: common.celsiusPatternStringProperty },
      SIDE_CONTENT_WIDTH,
    );
    temperatureControl.enabledProperty = readyProperty;
    const idealCheckbox = checkbox(model.idealProperty, common.idealCalorimeterStringProperty, SIDE_CONTENT_WIDTH);
    idealCheckbox.enabledProperty = readyProperty;
    const extrapolateCheckbox = checkbox(
      model.extrapolateProperty,
      common.extrapolateStringProperty,
      SIDE_CONTENT_WIDTH,
    );
    const reactionPanel = new CalorimetryLabPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          heading(strings.reactionHeadingStringProperty, SIDE_CONTENT_WIDTH),
          reactionMenu,
          temperatureControl,
          idealCheckbox,
          extrapolateCheckbox,
        ],
      }),
      { minWidth: SIDE_COLUMN_WIDTH, maxWidth: SIDE_COLUMN_WIDTH },
    );

    const mixButton = pushButton(strings.mixStringProperty, () => {
      model.mix();
      this.addAccessibleResponse(a11y.responses.mixedStringProperty.value);
    });
    mixButton.enabledProperty = readyProperty;
    const newTrialButton = pushButton(common.newTrialStringProperty, () => {
      model.newTrial();
      this.addAccessibleResponse(a11y.responses.newTrialStringProperty.value);
    });
    newTrialButton.enabledProperty = runningProperty;
    const calculationCheckbox = checkbox(
      this.showCalculationProperty,
      common.showCalculationStringProperty,
      SIDE_CONTENT_WIDTH,
    );
    calculationCheckbox.visibleProperty = options.showCalculationsProperty;
    const trialPanel = new CalorimetryLabPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [new HBox({ spacing: 8, children: [mixButton, newTrialButton] }), calculationCheckbox],
      }),
      { minWidth: SIDE_COLUMN_WIDTH, maxWidth: SIDE_COLUMN_WIDTH },
    );
    const timeControl = createTimeControl(model.timer.isPlayingProperty, model.timeSpeedProperty, () =>
      model.advance(1 / 60),
    );
    const sideColumn = new VBox({
      align: "center",
      spacing: PANEL_SPACING + 4,
      children: [reactionPanel, trialPanel, timeControl],
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      top: SCREEN_VIEW_MARGIN,
    });

    // Announce the end of the reaction once per trial.
    const completeProperty = new DerivedProperty([model.progressProperty], (progress) => progress > 0.99);
    completeProperty.lazyLink((complete) => {
      if (complete) {
        this.addAccessibleResponse(
          StringUtils.fillIn(a11y.responses.completePatternStringProperty.value, {
            deltaT: fixed(model.temperatureProperty.value - model.initialTemperatureProperty.value, 2),
          }),
        );
      }
    });

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });

    this.children = [this.apparatus, amountsPanel, chart, calculationPanel, sideColumn, resetAllButton, listParent];
    this.addChild(
      new Node({
        pdomOrder: [
          reactionMenu,
          ...amountControls,
          temperatureControl,
          idealCheckbox,
          mixButton,
          newTrialButton,
          extrapolateCheckbox,
          calculationCheckbox,
          timeControl,
          resetAllButton,
        ],
      }),
    );
  }

  public reset(): void {
    this.showCalculationProperty.reset();
  }

  public override step(dt: number): void {
    this.apparatus.step(dt);
  }
}
