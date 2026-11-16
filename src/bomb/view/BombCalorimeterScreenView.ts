import { BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS } from "../../CalorimetryLabConstants.js";
/**
 * BombCalorimeterScreenView.ts
 *
 * Bomb Calorimeter screen layout: the calorimeter on the left with the sample controls under it,
 * the water-temperature chart and the calculation in the middle, and the mode, calorimeter
 * constant, options, trial buttons and time controls on the right.
 *
 * Calibrate burns benzoic acid and works out C_cal; "Use This C_cal" carries the result over to
 * Measure, which works out ΔcU and ΔcH of the chosen sample with the student's C_cal. The button
 * waits for a valid result (the water settled and, if asked for, the drift line fitted).
 */

import { BooleanProperty, DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import CalorimetryLabColors from "../../CalorimetryLabColors.js";
import {
  BOMB_DRIFT_START_TIME,
  BOMB_START_TEMPERATURE,
  EXTRAPOLATION_FIT_DURATION,
  PANEL_SPACING,
  SCREEN_VIEW_MARGIN,
  SIDE_COLUMN_WIDTH,
} from "../../CalorimetryLabConstants.js";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/CalorimetryLabButtonOptions.js";
import { CalorimetryLabPanel } from "../../common/CalorimetryLabPanel.js";
import {
  checkbox,
  comboBox,
  heading,
  note,
  numberControl,
  pushButton,
  radioGroup,
} from "../../common/view/ControlFactory.js";
import { createTimeControl } from "../../common/view/createTimeControl.js";
import {
  fixed,
  formatEnthalpy,
  formatKilojoules,
  formatMoles,
  percentError,
  signed,
} from "../../common/view/formatValues.js";
import { RichTextLines } from "../../common/view/RichTextLines.js";
import { TemperatureChartNode } from "../../common/view/TemperatureChartNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { BombCalorimeterModel, BombMode } from "../model/BombCalorimeterModel.js";
import { bombDeltaT, calibratedConstant, calibrationResult, measure } from "../model/bombAnalysis.js";
import { enthalpyFromInternalEnergy, FUEL_LIST, FUELS } from "../model/Fuels.js";
import { BombApparatusNode } from "./BombApparatusNode.js";
import { BombCalorimeterScreenSummaryContent } from "./BombCalorimeterScreenSummaryContent.js";

type SelfOptions = {
  /** Preferences: show the worked calculation at all. */
  showCalculationsProperty: TReadOnlyProperty<boolean>;
};

export type BombCalorimeterScreenViewOptions = SelfOptions & ScreenViewOptions;

const LEFT_COLUMN_WIDTH: number = BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.LEFT_COLUMN_WIDTH;
const LEFT_CONTENT_WIDTH = LEFT_COLUMN_WIDTH - 24;
const CHART_LEFT: number = BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.CHART_LEFT;
const CHART_TOP: number = BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.CHART_TOP;
const CHART_WIDTH: number = BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.CHART_WIDTH;
const CHART_HEIGHT: number = BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.CHART_HEIGHT;
const CALCULATION_LEFT: number = BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.CALCULATION_LEFT;
const CALCULATION_WIDTH: number = BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.CALCULATION_WIDTH;
const SIDE_CONTENT_WIDTH = SIDE_COLUMN_WIDTH - 24;

export class BombCalorimeterScreenView extends ScreenView {
  private readonly apparatus: BombApparatusNode;
  private readonly showCalculationProperty = new BooleanProperty(true);

  public constructor(model: BombCalorimeterModel, providedOptions: BombCalorimeterScreenViewOptions) {
    const options = optionize<BombCalorimeterScreenViewOptions, SelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new BombCalorimeterScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const strings = StringManager.getInstance().getBombCalorimeterStrings();
    const common = StringManager.getInstance().getCommonStrings();
    const a11y = StringManager.getInstance().getBombCalorimeterA11yStrings();
    const listParent = new Node();
    const readyProperty = new DerivedProperty([model.phaseProperty], (phase) => phase === "ready");
    const runningProperty = new DerivedProperty([model.phaseProperty], (phase) => phase === "running");
    const measureModeProperty = new DerivedProperty([model.modeProperty], (mode) => mode === "measure");
    const deltaTProperty = new DerivedProperty(
      [model.peakTemperatureProperty, model.driftLineProperty, model.extrapolateProperty],
      (peak, drift, extrapolate) => bombDeltaT(peak, drift, extrapolate),
    );
    // The water has collected the heat from the bomb (in a leaky jacket the two never quite match).
    const settledProperty = new DerivedProperty(
      [model.phaseProperty, model.elapsedTimeProperty],
      (phase, time) => phase === "running" && time >= BOMB_DRIFT_START_TIME,
    );
    // The C_cal this calibration burn supports, or null while it has no valid one.
    const calibrationProperty = new DerivedProperty(
      [
        model.modeProperty,
        model.trialProperty,
        model.elapsedTimeProperty,
        model.peakTemperatureProperty,
        model.driftLineProperty,
        model.extrapolateProperty,
      ],
      (mode, trial, time, peak, drift, extrapolate) =>
        mode === "calibrate" && trial
          ? calibrationResult(trial.fuel, trial.mass, time, peak, drift, extrapolate)
          : null,
    );

    // ── Apparatus and sample ────────────────────────────────────────────────────
    this.apparatus = new BombApparatusNode(model);
    this.apparatus.left = SCREEN_VIEW_MARGIN;
    this.apparatus.top = SCREEN_VIEW_MARGIN;

    const fuelMenu = comboBox(
      model.fuelProperty,
      FUEL_LIST.map((fuel) => {
        const name = strings.names[`${fuel.id}StringProperty`];
        return {
          value: fuel,
          label: name,
          display: new DerivedProperty([name], (n) => `${n}, ${fuel.formula}`),
        };
      }),
      listParent,
      strings.sampleHeadingStringProperty,
      LEFT_CONTENT_WIDTH,
    );
    fuelMenu.enabledProperty = readyProperty;
    fuelMenu.visibleProperty = measureModeProperty;
    const calibrationNote = note(strings.calibrationNoteStringProperty, LEFT_CONTENT_WIDTH);
    calibrationNote.visibleProperty = DerivedProperty.not(measureModeProperty);
    const massControl = numberControl(
      strings.sampleMassStringProperty,
      model.massProperty,
      model.massProperty.range,
      {
        delta: BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.MASS_CONTROL_DELTA,
        decimalPlaces: BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.MASS_CONTROL_DECIMAL_PLACES,
        valuePattern: common.gramsPatternStringProperty,
      },
      LEFT_CONTENT_WIDTH,
    );
    massControl.enabledProperty = readyProperty;
    const samplePanel = new CalorimetryLabPanel(
      new VBox({
        align: "left",
        spacing: BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.SAMPLE_PANEL_SPACING,
        children: [
          heading(strings.sampleHeadingStringProperty, LEFT_CONTENT_WIDTH),
          calibrationNote,
          fuelMenu,
          massControl,
        ],
      }),
      { minWidth: LEFT_COLUMN_WIDTH, maxWidth: LEFT_COLUMN_WIDTH },
    );
    samplePanel.left = SCREEN_VIEW_MARGIN;
    samplePanel.top = this.apparatus.bottom + BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_TOP_OFFSET;

    // ── Chart ───────────────────────────────────────────────────────────────────
    const startTemperatureProperty = new DerivedProperty([model.phaseProperty], () => BOMB_START_TEMPERATURE);
    const chart = new TemperatureChartNode(
      model.record,
      [{ color: CalorimetryLabColors.waterTraceColorProperty, label: common.waterStringProperty }],
      CHART_WIDTH,
      CHART_HEIGHT,
      {
        minSpan: 0.5,
        minTime: 120,
        referenceTemperatureProperties: [startTemperatureProperty],
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
        deltaTProperty,
        model.calorimeterConstantProperty,
        model.peakTemperatureProperty,
        calibrationProperty,
        common.startPromptStringProperty,
        common.deltaTPeakPatternStringProperty,
        common.deltaTExtrapolatedPatternStringProperty,
        common.waitingForDriftPatternStringProperty,
        common.acceptedPatternStringProperty,
        strings.knownHeatPatternStringProperty,
        strings.constantPatternStringProperty,
        strings.calibrationWaitPatternStringProperty,
        strings.calorimeterHeatPatternStringProperty,
        strings.reactionHeatPatternStringProperty,
        strings.molesPatternStringProperty,
        strings.internalEnergyPatternStringProperty,
        strings.enthalpyPatternStringProperty,
        strings.constantVolumeNoteStringProperty,
      ],
      () => {
        const trial = model.trialProperty.value;
        if (model.phaseProperty.value === "ready" || !trial) {
          lines.setLines([common.startPromptStringProperty.value]);
          return;
        }
        const deltaT = deltaTProperty.value;
        const extrapolated = model.extrapolateProperty.value && model.driftLineProperty.value !== null;
        const deltaTLine = StringUtils.fillIn(
          (extrapolated ? common.deltaTExtrapolatedPatternStringProperty : common.deltaTPeakPatternStringProperty)
            .value,
          {
            final: fixed(BOMB_START_TEMPERATURE + deltaT, BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.DELTA_T_LINE_DECIMALS),
            initial: fixed(BOMB_START_TEMPERATURE, BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.DELTA_T_LINE_DECIMALS),
            value: fixed(deltaT, BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.DELTA_T_LINE_DECIMALS),
          },
        );
        const waiting =
          model.extrapolateProperty.value && !extrapolated
            ? StringUtils.fillIn(common.waitingForDriftPatternStringProperty.value, {
                from: BOMB_DRIFT_START_TIME,
                to: BOMB_DRIFT_START_TIME + EXTRAPOLATION_FIT_DURATION,
              })
            : "";
        const muted = CalorimetryLabColors.mutedTextColorProperty;
        const highlight = CalorimetryLabColors.targetColorProperty;
        if (trial.fuel === FUELS.benzoicAcid && model.modeProperty.value === "calibrate") {
          const q = (-trial.fuel.internalEnergy * trial.mass) / trial.fuel.molarMass;
          const calibrationWait =
            calibrationProperty.value === null
              ? StringUtils.fillIn(strings.calibrationWaitPatternStringProperty.value, {
                  time: BOMB_DRIFT_START_TIME + (model.extrapolateProperty.value ? EXTRAPOLATION_FIT_DURATION : 0),
                })
              : "";
          lines.setLines(
            [
              trial.fuel.equation,
              StringUtils.fillIn(strings.knownHeatPatternStringProperty.value, {
                mass: fixed(trial.mass, BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.MASS_FIXED_DECIMALS),
                q: fixed(q, BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.FIXED_DECIMALS),
              }),
              deltaTLine,
              StringUtils.fillIn(strings.constantPatternStringProperty.value, {
                q: fixed(q, BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.FIXED_DECIMALS),
                deltaT: fixed(deltaT, BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.FIXED_DECIMALS),
                value: fixed(
                  calibratedConstant(trial.fuel, trial.mass, deltaT),
                  BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.FIXED_DECIMALS,
                ),
              }),
              calibrationWait,
              waiting,
            ],
            [undefined, undefined, undefined, highlight, muted, muted],
          );
          return;
        }
        const result = measure(trial.fuel, trial.mass, deltaT, model.calorimeterConstantProperty.value);
        const accepted = enthalpyFromInternalEnergy(trial.fuel.internalEnergy, trial.fuel.gasMolesChange);
        const close = Math.abs(result.enthalpy / accepted - 1) < 0.01;
        lines.setLines(
          [
            trial.fuel.equation,
            deltaTLine,
            StringUtils.fillIn(strings.calorimeterHeatPatternStringProperty.value, {
              c: fixed(
                model.calorimeterConstantProperty.value,
                BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.FIXED_DECIMALS_SEGMENT_2,
              ),
              deltaT: fixed(deltaT, BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.FIXED_DECIMALS),
              q: formatKilojoules(result.calorimeterHeat),
            }),
            StringUtils.fillIn(strings.reactionHeatPatternStringProperty.value, {
              q: formatKilojoules(result.reactionHeat),
              perGram: fixed(result.energyPerGram, BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.FIXED_DECIMALS_SEGMENT_2),
            }),
            StringUtils.fillIn(strings.molesPatternStringProperty.value, {
              mass: fixed(trial.mass, BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.MASS_FIXED_DECIMALS),
              molarMass: fixed(trial.fuel.molarMass, BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.FIXED_DECIMALS_SEGMENT_2),
              value: formatMoles(result.moles),
            }),
            StringUtils.fillIn(strings.internalEnergyPatternStringProperty.value, {
              value: fixed(result.internalEnergy, 0),
            }),
            StringUtils.fillIn(strings.enthalpyPatternStringProperty.value, {
              u: fixed(result.internalEnergy, 0),
              dn: signed(trial.fuel.gasMolesChange, 1),
              value: fixed(result.enthalpy, 0),
            }),
            StringUtils.fillIn(common.acceptedPatternStringProperty.value, {
              value: formatEnthalpy(accepted),
              error: percentError(result.enthalpy, accepted),
            }),
            strings.constantVolumeNoteStringProperty.value,
            waiting,
          ],
          [
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            highlight,
            close ? CalorimetryLabColors.goodColorProperty : CalorimetryLabColors.poorColorProperty,
            muted,
            muted,
          ],
        );
      },
    );
    const calculationVisibleProperty = DerivedProperty.and([
      options.showCalculationsProperty,
      this.showCalculationProperty,
    ]);
    const calculationPanel = new CalorimetryLabPanel(
      new VBox({
        align: "left",
        spacing: BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.CALCULATION_PANEL_SPACING,
        children: [
          heading(
            common.calculationHeadingStringProperty,
            BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.CALCULATION_HEADING_HEADING_MAX_WIDTH,
          ),
          lines,
        ],
      }),
      { minWidth: CALCULATION_WIDTH, maxWidth: CALCULATION_WIDTH, visibleProperty: calculationVisibleProperty },
    );
    calculationPanel.left = CALCULATION_LEFT;
    calculationPanel.top = CHART_TOP + CHART_HEIGHT + 54;

    // ── Mode and calorimeter ────────────────────────────────────────────────────
    const modeRadio = radioGroup<BombMode>(
      model.modeProperty,
      [
        { value: "calibrate", label: strings.calibrateStringProperty },
        { value: "measure", label: strings.measureStringProperty },
      ],
      strings.modeHeadingStringProperty,
      SIDE_CONTENT_WIDTH,
      "horizontal",
    );
    const constantControl = numberControl(
      strings.calorimeterConstantStringProperty,
      model.calorimeterConstantProperty,
      model.calorimeterConstantProperty.range,
      {
        delta: BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.CONSTANT_CONTROL_DELTA,
        decimalPlaces: BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.CONSTANT_CONTROL_DECIMAL_PLACES,
        valuePattern: common.kilojoulesPerDegreePatternStringProperty,
        accessibleName: strings.calorimeterConstantNameStringProperty,
      },
      SIDE_CONTENT_WIDTH,
    );
    constantControl.visibleProperty = measureModeProperty;
    const idealCheckbox = checkbox(model.idealProperty, common.idealCalorimeterStringProperty, SIDE_CONTENT_WIDTH);
    idealCheckbox.enabledProperty = readyProperty;
    const extrapolateCheckbox = checkbox(
      model.extrapolateProperty,
      common.extrapolateStringProperty,
      SIDE_CONTENT_WIDTH,
    );
    const modePanel = new CalorimetryLabPanel(
      new VBox({
        align: "left",
        spacing: BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.MODE_PANEL_SPACING,
        children: [
          heading(strings.modeHeadingStringProperty, SIDE_CONTENT_WIDTH),
          modeRadio,
          constantControl,
          idealCheckbox,
          extrapolateCheckbox,
        ],
      }),
      { minWidth: SIDE_COLUMN_WIDTH, maxWidth: SIDE_COLUMN_WIDTH },
    );

    const igniteButton = pushButton(strings.igniteStringProperty, () => {
      model.ignite();
      this.addAccessibleResponse(a11y.responses.ignitedStringProperty.value);
    });
    igniteButton.enabledProperty = readyProperty;
    const newTrialButton = pushButton(common.newTrialStringProperty, () => {
      model.newTrial();
      this.addAccessibleResponse(a11y.responses.newTrialStringProperty.value);
    });
    newTrialButton.enabledProperty = runningProperty;
    const useCalibrationButton = pushButton(strings.useCalibrationStringProperty, () => {
      const value = calibrationProperty.value;
      if (value !== null && model.useCalibration(value)) {
        this.addAccessibleResponse(
          StringUtils.fillIn(a11y.responses.calibrationUsedPatternStringProperty.value, {
            value: fixed(
              model.calorimeterConstantProperty.value,
              BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.USE_CALIBRATION_BUTTON_DECIMALS,
            ),
          }),
        );
      }
    });
    useCalibrationButton.visibleProperty = DerivedProperty.not(measureModeProperty);
    useCalibrationButton.enabledProperty = new DerivedProperty([calibrationProperty], (value) => value !== null);
    const calculationCheckbox = checkbox(
      this.showCalculationProperty,
      common.showCalculationStringProperty,
      SIDE_CONTENT_WIDTH,
    );
    calculationCheckbox.visibleProperty = options.showCalculationsProperty;
    const trialPanel = new CalorimetryLabPanel(
      new VBox({
        align: "left",
        spacing: BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.TRIAL_PANEL_SPACING,
        children: [
          new HBox({
            spacing: BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.TRIAL_PANEL_SPACING,
            children: [igniteButton, newTrialButton],
          }),
          useCalibrationButton,
          calculationCheckbox,
        ],
      }),
      { minWidth: SIDE_COLUMN_WIDTH, maxWidth: SIDE_COLUMN_WIDTH },
    );
    const timeControl = createTimeControl(model.timer.isPlayingProperty, model.timeSpeedProperty, () =>
      model.advance(1 / 60),
    );
    const sideColumn = new VBox({
      align: "center",
      spacing: PANEL_SPACING + BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.SIDE_COLUMN_SPACING_OFFSET,
      children: [modePanel, trialPanel, timeControl],
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      top: SCREEN_VIEW_MARGIN,
    });

    // Announce when the water has settled.
    settledProperty.lazyLink((settled) => {
      if (settled) {
        this.addAccessibleResponse(
          StringUtils.fillIn(a11y.responses.settledPatternStringProperty.value, {
            temperature: fixed(
              model.waterTemperatureProperty.value,
              BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS.VALUE_FIXED_DECIMALS,
            ),
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

    this.children = [this.apparatus, samplePanel, chart, calculationPanel, sideColumn, resetAllButton, listParent];
    this.addChild(
      new Node({
        pdomOrder: [
          modeRadio,
          fuelMenu,
          massControl,
          constantControl,
          idealCheckbox,
          igniteButton,
          newTrialButton,
          useCalibrationButton,
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
