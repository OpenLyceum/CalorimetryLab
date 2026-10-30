/**
 * HessLawScreenView.ts
 *
 * Hess's Law screen layout: the target reaction, the step cards and their sum down the left; the
 * puzzle menu, the enthalpy diagram and the formation-route option on the right.
 *
 * The sum is shown twice: first every species the steps put on each side, with the amount that
 * appears on both sides struck out (only the smaller amount, so 1 O₂ against 1/2 O₂ shows
 * "1/2 O₂ + struck 1/2 O₂" on one side and a struck 1/2 O₂ on the other), then the net equation
 * left after cancelling.
 */

import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { Node, RichText, VBox } from "scenerystack/scenery";
import { PhetFont, ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import CalorimetryLabColors from "../../CalorimetryLabColors.js";
import { FONT_SIZE, PANEL_SPACING, SCREEN_VIEW_MARGIN } from "../../CalorimetryLabConstants.js";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/CalorimetryLabButtonOptions.js";
import { CalorimetryLabPanel } from "../../common/CalorimetryLabPanel.js";
import { checkbox, comboBox, heading, note } from "../../common/view/ControlFactory.js";
import { formatEnthalpy } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import { formatGrossSum, grossSum } from "../model/grossSum.js";
import { type HessLawModel, MAX_STEPS } from "../model/HessLawModel.js";
import { HESS_PUZZLES } from "../model/HessPuzzles.js";
import { formatEquation, type ReactionEquation } from "../model/ReactionEquation.js";
import { EnthalpyDiagramNode } from "./EnthalpyDiagramNode.js";
import { HessLawScreenSummaryContent } from "./HessLawScreenSummaryContent.js";
import { StepCardNode } from "./StepCardNode.js";

type SelfOptions = {
  /** Preferences: show the formation-route arithmetic. */
  showCalculationsProperty: TReadOnlyProperty<boolean>;
};

export type HessLawScreenViewOptions = SelfOptions & ScreenViewOptions;

const LEFT_WIDTH = 590;
const RIGHT_WIDTH = 374;
const DIAGRAM_WIDTH = 330;
const DIAGRAM_HEIGHT = 270;

/** The steps added up, each cancelled amount struck out in the cancelled colour. */
function grossSumMarkup(steps: readonly ReactionEquation[]): string {
  const color = CalorimetryLabColors.cancelledColorProperty.value.toCSS();
  return formatGrossSum(grossSum(steps), (term) => `<span style="color: ${color}"><s>${term}</s></span>`);
}

export class HessLawScreenView extends ScreenView {
  public constructor(model: HessLawModel, providedOptions: HessLawScreenViewOptions) {
    const options = optionize<HessLawScreenViewOptions, SelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new HessLawScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const strings = StringManager.getInstance().getHessLawStrings();
    const a11y = StringManager.getInstance().getHessLawA11yStrings();
    const listParent = new Node();
    const contentWidth = LEFT_WIDTH - 24;
    const textOptions = { font: new PhetFont(FONT_SIZE.label), fill: CalorimetryLabColors.textColorProperty };

    // ── Target ──────────────────────────────────────────────────────────────────
    const targetText = new RichText("", { ...textOptions, maxWidth: contentWidth - 140 });
    const targetEnthalpy = new RichText("", {
      font: new PhetFont({ size: FONT_SIZE.label, weight: "bold" }),
      fill: CalorimetryLabColors.targetColorProperty,
      maxWidth: 130,
    });
    const targetRow = new Node({ children: [targetText, targetEnthalpy] });
    Multilink.multilinkAny(
      [
        model.puzzleProperty,
        model.solvedProperty,
        strings.targetPatternStringProperty,
        strings.unknownEnthalpyStringProperty,
        strings.enthalpyPatternStringProperty,
      ],
      () => {
        const puzzle = model.puzzleProperty.value;
        targetText.string = StringUtils.fillIn(strings.targetPatternStringProperty.value, {
          equation: formatEquation(puzzle.target),
        });
        targetEnthalpy.string = model.solvedProperty.value
          ? StringUtils.fillIn(strings.enthalpyPatternStringProperty.value, {
              value: formatEnthalpy(model.sumProperty.value.enthalpy),
            })
          : strings.unknownEnthalpyStringProperty.value;
        targetText.left = 0;
        targetEnthalpy.right = contentWidth;
        targetEnthalpy.centerY = targetText.centerY;
      },
    );
    const targetPanel = new CalorimetryLabPanel(targetRow, {
      minWidth: LEFT_WIDTH,
      maxWidth: LEFT_WIDTH,
      stroke: CalorimetryLabColors.targetColorProperty,
    });

    // ── Steps ───────────────────────────────────────────────────────────────────
    const cards = Array.from({ length: MAX_STEPS }, (_, i) => new StepCardNode(model, i, LEFT_WIDTH));

    // ── Sum ─────────────────────────────────────────────────────────────────────
    const grossText = new RichText("", { ...textOptions, lineWrap: contentWidth });
    const netText = new RichText("", { ...textOptions, maxWidth: contentWidth });
    const verdictText = new RichText("", { ...textOptions, lineWrap: contentWidth });
    Multilink.multilinkAny(
      [
        model.usedStepsProperty,
        model.solvedProperty,
        strings.netPatternStringProperty,
        strings.emptyNetStringProperty,
        strings.solvedPatternStringProperty,
        strings.notSolvedStringProperty,
        CalorimetryLabColors.cancelledColorProperty,
      ],
      () => {
        const sum = model.sumProperty.value;
        grossText.string = grossSumMarkup(model.usedStepsProperty.value);
        netText.string =
          sum.coefficients.size === 0
            ? strings.emptyNetStringProperty.value
            : StringUtils.fillIn(strings.netPatternStringProperty.value, { equation: formatEquation(sum) });
        const solved = model.solvedProperty.value;
        verdictText.string = solved
          ? StringUtils.fillIn(strings.solvedPatternStringProperty.value, { value: formatEnthalpy(sum.enthalpy) })
          : strings.notSolvedStringProperty.value;
        verdictText.fill = solved
          ? CalorimetryLabColors.goodColorProperty
          : CalorimetryLabColors.mutedTextColorProperty;
      },
    );
    const sumPanel = new CalorimetryLabPanel(
      new VBox({
        align: "left",
        spacing: 6,
        children: [
          heading(strings.sumHeadingStringProperty, contentWidth),
          grossText,
          note(strings.cancelNoteStringProperty, contentWidth),
          netText,
          verdictText,
        ],
      }),
      { minWidth: LEFT_WIDTH, maxWidth: LEFT_WIDTH },
    );

    const leftColumn = new VBox({
      align: "left",
      spacing: PANEL_SPACING,
      children: [targetPanel, ...cards, sumPanel],
      left: SCREEN_VIEW_MARGIN,
      top: SCREEN_VIEW_MARGIN,
    });

    // ── Puzzle menu, diagram, formation route ───────────────────────────────────
    const puzzleMenu = comboBox(
      model.puzzleProperty,
      HESS_PUZZLES.map((puzzle) => ({ value: puzzle, label: strings.names[`${puzzle.id}StringProperty`] })),
      listParent,
      strings.puzzleHeadingStringProperty,
      RIGHT_WIDTH - 24,
    );
    const puzzlePanel = new CalorimetryLabPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [heading(strings.puzzleHeadingStringProperty, RIGHT_WIDTH - 24), puzzleMenu],
      }),
      { minWidth: RIGHT_WIDTH, maxWidth: RIGHT_WIDTH },
    );
    const diagram = new EnthalpyDiagramNode(model, DIAGRAM_WIDTH, DIAGRAM_HEIGHT);
    const formationCheckbox = checkbox(
      model.formationRouteProperty,
      strings.formationRouteStringProperty,
      RIGHT_WIDTH - 24,
    );
    const formationText = new RichText("", {
      font: new PhetFont(FONT_SIZE.small),
      fill: CalorimetryLabColors.textColorProperty,
      lineWrap: RIGHT_WIDTH - 24,
    });
    formationText.visibleProperty = DerivedProperty.and([
      model.formationRouteProperty,
      options.showCalculationsProperty,
    ]);
    Multilink.multilink([model.puzzleProperty, strings.formationPatternStringProperty], (puzzle, pattern) => {
      const products = puzzle.target.productFormationEnthalpy();
      const reactants = puzzle.target.reactantFormationEnthalpy();
      formationText.string = StringUtils.fillIn(pattern, {
        products: formatEnthalpy(products),
        reactants: formatEnthalpy(reactants),
        value: formatEnthalpy(products - reactants),
      });
    });
    const diagramPanel = new CalorimetryLabPanel(
      new VBox({
        align: "left",
        spacing: 10,
        children: [
          heading(strings.diagramTitleStringProperty, RIGHT_WIDTH - 24),
          new Node({ children: [diagram], x: 0 }),
          formationCheckbox,
          formationText,
        ],
      }),
      { minWidth: RIGHT_WIDTH, maxWidth: RIGHT_WIDTH },
    );
    diagram.x = 34;
    const rightColumn = new VBox({
      align: "left",
      spacing: PANEL_SPACING,
      children: [puzzlePanel, diagramPanel],
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      top: SCREEN_VIEW_MARGIN,
    });

    // ── Responses ───────────────────────────────────────────────────────────────
    model.solvedProperty.lazyLink((solved) => {
      if (solved) {
        this.addAccessibleResponse(
          StringUtils.fillIn(a11y.responses.solvedPatternStringProperty.value, {
            value: formatEnthalpy(model.sumProperty.value.enthalpy),
          }),
        );
      }
    });
    model.stepStates.forEach((state, i) => {
      const announce = () => {
        const step = model.usedStepsProperty.value[i];
        if (step) {
          this.addAccessibleResponse(
            StringUtils.fillIn(a11y.responses.stepPatternStringProperty.value, {
              number: i + 1,
              equation: formatEquation(step, true),
              value: formatEnthalpy(step.enthalpy),
            }),
          );
        }
      };
      state.reversedProperty.lazyLink(announce);
      state.factorProperty.lazyLink(announce);
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

    this.children = [leftColumn, rightColumn, resetAllButton, listParent];
    this.addChild(
      new Node({
        pdomOrder: [
          puzzleMenu,
          ...cards.flatMap((card) => [card.reverseCheckbox, card.factorRadio]),
          formationCheckbox,
          resetAllButton,
        ],
      }),
    );
  }

  public reset(): void {
    // No view-only state beyond what the model resets.
  }
}
