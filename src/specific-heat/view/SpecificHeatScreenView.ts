/**
 * SpecificHeatScreenView.ts
 *
 * Specific Heat screen layout: the bath and cup on the left with the water controls under them,
 * the temperature chart and the heat calculation in the middle, and the sample controls, trial
 * buttons and time controls on the right.
 */

import { BooleanProperty, DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import CalorimetryLabColors from "../../CalorimetryLabColors.js";
import {
  EQUILIBRIUM_TOLERANCE,
  PANEL_SPACING,
  SCREEN_VIEW_MARGIN,
  SIDE_COLUMN_WIDTH,
} from "../../CalorimetryLabConstants.js";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/CalorimetryLabButtonOptions.js";
import { CalorimetryLabPanel } from "../../common/CalorimetryLabPanel.js";
import { checkbox, comboBox, heading, label, numberControl, pushButton } from "../../common/view/ControlFactory.js";
import { createTimeControl } from "../../common/view/createTimeControl.js";
import { fixed, formatJoules } from "../../common/view/formatValues.js";
import { RichTextLines } from "../../common/view/RichTextLines.js";
import { TemperatureChartNode } from "../../common/view/TemperatureChartNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import { SAMPLE_LIST, type Sample } from "../model/Samples.js";
import type { SpecificHeatModel } from "../model/SpecificHeatModel.js";
import { SpecificHeatApparatusNode } from "./SpecificHeatApparatusNode.js";
import { SpecificHeatScreenSummaryContent } from "./SpecificHeatScreenSummaryContent.js";

type SelfOptions = {
  /** Preferences: show the worked calculation at all. */
  showCalculationsProperty: TReadOnlyProperty<boolean>;
};

export type SpecificHeatScreenViewOptions = SelfOptions & ScreenViewOptions;

const LEFT_COLUMN_WIDTH = 318;
const LEFT_CONTENT_WIDTH = LEFT_COLUMN_WIDTH - 24;
const CHART_LEFT = 404;
const CHART_TOP = 44;
const CHART_WIDTH = 344;
const CHART_HEIGHT = 190;
const CALCULATION_LEFT = 350;
const CALCULATION_WIDTH = 404;
const SIDE_CONTENT_WIDTH = SIDE_COLUMN_WIDTH - 24;

export class SpecificHeatScreenView extends ScreenView {
  private readonly apparatus: SpecificHeatApparatusNode;
  private readonly showCalculationProperty = new BooleanProperty(true);

  public constructor(model: SpecificHeatModel, providedOptions: SpecificHeatScreenViewOptions) {
    const options = optionize<SpecificHeatScreenViewOptions, SelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new SpecificHeatScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const strings = StringManager.getInstance().getSpecificHeatStrings();
    const common = StringManager.getInstance().getCommonStrings();
    const a11y = StringManager.getInstance().getSpecificHeatA11yStrings();
    const names = strings.names;
    const listParent = new Node();
    const readyProperty = new DerivedProperty([model.phaseProperty], (phase) => phase === "ready");
    const runningProperty = new DerivedProperty([model.phaseProperty], (phase) => phase === "running");

    // ── Apparatus and water controls ────────────────────────────────────────────
    this.apparatus = new SpecificHeatApparatusNode(model);
    this.apparatus.left = SCREEN_VIEW_MARGIN + 10;
    this.apparatus.top = SCREEN_VIEW_MARGIN;

    const waterMassControl = numberControl(
      strings.waterMassStringProperty,
      model.waterMassProperty,
      model.waterMassProperty.range,
      { delta: 1, decimalPlaces: 0, valuePattern: common.gramsPatternStringProperty },
      LEFT_CONTENT_WIDTH,
    );
    const waterTemperatureControl = numberControl(
      strings.waterTemperatureStringProperty,
      model.waterInitialTemperatureProperty,
      model.waterInitialTemperatureProperty.range,
      { delta: 0.5, decimalPlaces: 1, valuePattern: common.celsiusPatternStringProperty },
      LEFT_CONTENT_WIDTH,
    );
    const insulatedCheckbox = checkbox(model.insulatedProperty, common.insulatedStringProperty, LEFT_CONTENT_WIDTH);
    for (const control of [waterMassControl, waterTemperatureControl, insulatedCheckbox]) {
      control.enabledProperty = readyProperty;
    }
    const waterPanel = new CalorimetryLabPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          heading(strings.waterHeadingStringProperty, LEFT_CONTENT_WIDTH),
          waterMassControl,
          waterTemperatureControl,
          insulatedCheckbox,
        ],
      }),
      { minWidth: LEFT_COLUMN_WIDTH, maxWidth: LEFT_COLUMN_WIDTH },
    );
    waterPanel.left = SCREEN_VIEW_MARGIN;
    waterPanel.top = this.apparatus.bottom + 16;

    // ── Chart ───────────────────────────────────────────────────────────────────
    const chart = new TemperatureChartNode(
      model.record,
      [
        { color: CalorimetryLabColors.sampleTraceColorProperty, label: common.sampleStringProperty },
        { color: CalorimetryLabColors.waterTraceColorProperty, label: common.waterStringProperty },
      ],
      CHART_WIDTH,
      CHART_HEIGHT,
      {
        minSpan: 10,
        referenceTemperatureProperties: [model.sampleInitialTemperatureProperty, model.waterInitialTemperatureProperty],
      },
    );
    chart.x = CHART_LEFT;
    chart.y = CHART_TOP;

    // ── Calculation ─────────────────────────────────────────────────────────────
    const lines = new RichTextLines(6, CALCULATION_WIDTH - 24);
    Multilink.multilinkAny(
      [
        model.phaseProperty,
        model.sampleProperty,
        model.revealProperty,
        model.waterTemperatureProperty,
        model.sampleTemperatureProperty,
        model.heatFlowProperty,
        model.insulatedProperty,
        strings.waterHeatPatternStringProperty,
        strings.sampleHeatPatternStringProperty,
        strings.unknownHeatPatternStringProperty,
        strings.specificHeatPatternStringProperty,
        strings.balancePatternStringProperty,
        strings.balancedNoteStringProperty,
        strings.lossNoteStringProperty,
        strings.flowingPatternStringProperty,
        strings.equilibriumPatternStringProperty,
        common.startPromptStringProperty,
      ],
      () => {
        if (model.phaseProperty.value === "ready") {
          lines.setLines([common.startPromptStringProperty.value]);
          return;
        }
        const sample = model.sampleProperty.value;
        const waterDeltaT = model.waterTemperatureProperty.value - model.waterInitialTemperatureProperty.value;
        const sampleDeltaT = model.sampleTemperatureProperty.value - model.sampleInitialTemperatureProperty.value;
        const waterHeat = model.waterHeatProperty.value;
        const sampleHeat = model.sampleHeatProperty.value;
        const waterLine = StringUtils.fillIn(strings.waterHeatPatternStringProperty.value, {
          mass: fixed(model.waterMassProperty.value, 0),
          deltaT: fixed(waterDeltaT, 2),
          q: formatJoules(waterHeat),
        });
        const texts = [waterLine];
        if (sample.unknown && !model.revealProperty.value) {
          texts.push(
            StringUtils.fillIn(strings.unknownHeatPatternStringProperty.value, {
              final: fixed(model.sampleTemperatureProperty.value, 2),
              initial: fixed(model.sampleInitialTemperatureProperty.value, 1),
              deltaT: fixed(sampleDeltaT, 2),
            }),
            Math.abs(sampleDeltaT) > 0.01
              ? StringUtils.fillIn(strings.specificHeatPatternStringProperty.value, {
                  q: formatJoules(waterHeat),
                  mass: fixed(model.sampleMassProperty.value, 0),
                  deltaT: fixed(sampleDeltaT, 2),
                  c: fixed(-waterHeat / (model.sampleMassProperty.value * sampleDeltaT), 3),
                })
              : "",
          );
        } else {
          texts.push(
            StringUtils.fillIn(strings.sampleHeatPatternStringProperty.value, {
              mass: fixed(model.sampleMassProperty.value, 0),
              c: fixed(sample.specificHeat, 3),
              deltaT: fixed(sampleDeltaT, 2),
              q: formatJoules(sampleHeat),
            }),
          );
        }
        const sum = sampleHeat + waterHeat;
        texts.push(
          StringUtils.fillIn(strings.balancePatternStringProperty.value, { sum: formatJoules(sum) }),
          Math.abs(sum) < 1 ? strings.balancedNoteStringProperty.value : strings.lossNoteStringProperty.value,
        );
        const settled =
          Math.abs(model.sampleTemperatureProperty.value - model.waterTemperatureProperty.value) <
          EQUILIBRIUM_TOLERANCE;
        texts.push(
          settled
            ? StringUtils.fillIn(strings.equilibriumPatternStringProperty.value, {
                value: fixed(model.waterTemperatureProperty.value, 2),
              })
            : StringUtils.fillIn(strings.flowingPatternStringProperty.value, {
                value: fixed(model.heatFlowProperty.value, 1),
              }),
        );
        lines.setLines(texts, [
          undefined,
          undefined,
          undefined,
          undefined,
          settled ? CalorimetryLabColors.goodColorProperty : CalorimetryLabColors.mutedTextColorProperty,
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
    calculationPanel.top = CHART_TOP + CHART_HEIGHT + 56;

    // ── Sample controls ─────────────────────────────────────────────────────────
    const sampleChoices = SAMPLE_LIST.map((sample) => {
      const name = names[`${sample.id}StringProperty`];
      return {
        value: sample,
        label: name,
        display: sample.unknown
          ? name
          : new DerivedProperty([name, strings.sampleItemPatternStringProperty], (n, pattern) =>
              StringUtils.fillIn(pattern, { name: n, c: fixed(sample.specificHeat, 3) }),
            ),
      };
    });
    const sampleMenu = comboBox(
      model.sampleProperty,
      sampleChoices,
      listParent,
      strings.sampleHeadingStringProperty,
      SIDE_CONTENT_WIDTH,
    );
    const sampleMassControl = numberControl(
      strings.sampleMassStringProperty,
      model.sampleMassProperty,
      model.sampleMassProperty.range,
      { delta: 1, decimalPlaces: 0, valuePattern: common.gramsPatternStringProperty },
      SIDE_CONTENT_WIDTH,
    );
    const bathControl = numberControl(
      strings.bathTemperatureStringProperty,
      model.sampleInitialTemperatureProperty,
      model.sampleInitialTemperatureProperty.range,
      { delta: 1, decimalPlaces: 0, valuePattern: common.celsiusPatternStringProperty },
      SIDE_CONTENT_WIDTH,
    );
    for (const control of [sampleMenu, sampleMassControl, bathControl]) {
      control.enabledProperty = readyProperty;
    }
    const unknownProperty = new DerivedProperty([model.sampleProperty], (sample: Sample) => sample.unknown);
    const revealCheckbox = checkbox(model.revealProperty, strings.revealStringProperty, SIDE_CONTENT_WIDTH);
    revealCheckbox.visibleProperty = unknownProperty;
    const revealedText = label("", SIDE_CONTENT_WIDTH);
    Multilink.multilinkAny(
      [model.sampleProperty, model.revealProperty, strings.revealedPatternStringProperty, names.titaniumStringProperty],
      () => {
        const sample = model.sampleProperty.value;
        revealedText.visible = sample.unknown && model.revealProperty.value;
        revealedText.string = StringUtils.fillIn(strings.revealedPatternStringProperty.value, {
          name: names[`${sample.metal}StringProperty`].value,
          c: fixed(sample.specificHeat, 3),
        });
      },
    );
    const samplePanel = new CalorimetryLabPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          heading(strings.sampleHeadingStringProperty, SIDE_CONTENT_WIDTH),
          sampleMenu,
          sampleMassControl,
          bathControl,
          revealCheckbox,
          revealedText,
        ],
      }),
      { minWidth: SIDE_COLUMN_WIDTH, maxWidth: SIDE_COLUMN_WIDTH },
    );

    const dropButton = pushButton(strings.dropStringProperty, () => {
      model.drop();
      this.addAccessibleResponse(a11y.responses.droppedStringProperty.value);
    });
    dropButton.enabledProperty = readyProperty;
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
        children: [new HBox({ spacing: 8, children: [dropButton, newTrialButton] }), calculationCheckbox],
      }),
      { minWidth: SIDE_COLUMN_WIDTH, maxWidth: SIDE_COLUMN_WIDTH },
    );
    const timeControl = createTimeControl(model.timer.isPlayingProperty, model.timeSpeedProperty, () =>
      model.advance(1 / 60),
    );
    const sideColumn = new VBox({
      align: "center",
      spacing: PANEL_SPACING + 4,
      children: [samplePanel, trialPanel, timeControl],
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      top: SCREEN_VIEW_MARGIN,
    });

    // Announce thermal equilibrium once per trial.
    const settledProperty = new DerivedProperty(
      [model.phaseProperty, model.sampleTemperatureProperty, model.waterTemperatureProperty],
      (phase, sampleT, waterT) => phase === "running" && Math.abs(sampleT - waterT) < EQUILIBRIUM_TOLERANCE,
    );
    settledProperty.lazyLink((settled) => {
      if (settled) {
        this.addAccessibleResponse(
          StringUtils.fillIn(a11y.responses.equilibriumPatternStringProperty.value, {
            value: fixed(model.waterTemperatureProperty.value, 1),
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

    this.children = [this.apparatus, waterPanel, chart, calculationPanel, sideColumn, resetAllButton, listParent];
    this.addChild(
      new Node({
        pdomOrder: [
          sampleMenu,
          sampleMassControl,
          bathControl,
          waterMassControl,
          waterTemperatureControl,
          insulatedCheckbox,
          dropButton,
          newTrialButton,
          revealCheckbox,
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
