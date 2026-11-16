import { STEP_CARD_NODE_SETTINGS } from "../../CalorimetryLabConstants.js";
/**
 * StepCardNode.ts
 *
 * One step reaction of a Hess's-law puzzle as the student has it: the equation (reversed and
 * multiplied as chosen) with its ΔH, a Reverse checkbox and the multiplier buttons. A card is
 * hidden when the puzzle has fewer steps than cards.
 */

import { DerivedProperty, Multilink } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, RichText, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import type { AquaRadioButtonGroup, Checkbox } from "scenerystack/sun";
import CalorimetryLabColors from "../../CalorimetryLabColors.js";
import { FONT_SIZE } from "../../CalorimetryLabConstants.js";
import { CalorimetryLabPanel } from "../../common/CalorimetryLabPanel.js";
import { checkbox, HEADING_FONT, radioGroup } from "../../common/view/ControlFactory.js";
import { formatEnthalpy } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { HessLawModel, StepState } from "../model/HessLawModel.js";
import { formatEquation } from "../model/ReactionEquation.js";

const TITLE_WIDTH: number = STEP_CARD_NODE_SETTINGS.TITLE_WIDTH;
const ENTHALPY_WIDTH: number = STEP_CARD_NODE_SETTINGS.ENTHALPY_WIDTH;

export class StepCardNode extends CalorimetryLabPanel {
  public readonly reverseCheckbox: Checkbox;
  public readonly factorRadio: AquaRadioButtonGroup<number>;

  public constructor(model: HessLawModel, index: number, width: number) {
    const strings = StringManager.getInstance().getHessLawStrings();
    const a11y = StringManager.getInstance().getHessLawA11yStrings();
    const state = model.stepStates[index] as StepState;
    const number = index + 1;

    const title = new Text(
      new DerivedProperty([strings.stepPatternStringProperty], (pattern) => StringUtils.fillIn(pattern, { number })),
      { font: HEADING_FONT, fill: CalorimetryLabColors.textColorProperty, maxWidth: TITLE_WIDTH },
    );
    const equation = new RichText("", {
      font: new PhetFont(FONT_SIZE.label),
      fill: CalorimetryLabColors.textColorProperty,
      maxWidth: width - TITLE_WIDTH - ENTHALPY_WIDTH - STEP_CARD_NODE_SETTINGS.EQUATION_MAX_WIDTH_OFFSET,
    });
    const enthalpy = new RichText("", {
      font: new PhetFont({ size: FONT_SIZE.label, weight: "bold" }),
      maxWidth: ENTHALPY_WIDTH,
    });
    Multilink.multilink([model.usedStepsProperty, strings.enthalpyPatternStringProperty], (steps, pattern) => {
      const step = steps[index];
      if (step) {
        equation.string = formatEquation(step);
        enthalpy.string = StringUtils.fillIn(pattern, { value: formatEnthalpy(step.enthalpy) });
        enthalpy.fill =
          step.enthalpy < 0
            ? CalorimetryLabColors.exothermicColorProperty
            : CalorimetryLabColors.endothermicColorProperty;
      }
    });

    const reverseCheckbox = checkbox(
      state.reversedProperty,
      strings.reverseStringProperty,
      STEP_CARD_NODE_SETTINGS.REVERSED_CHECKBOX_MAX_WIDTH,
      new DerivedProperty([a11y.reversePatternStringProperty], (pattern) => StringUtils.fillIn(pattern, { number })),
    );
    const factorRadio = radioGroup<number>(
      state.factorProperty,
      [
        { value: 0.5, label: strings.factorNames.halfStringProperty, display: strings.factors.halfStringProperty },
        { value: 1, label: strings.factorNames.oneStringProperty, display: strings.factors.oneStringProperty },
        { value: 2, label: strings.factorNames.twoStringProperty, display: strings.factors.twoStringProperty },
        { value: 3, label: strings.factorNames.threeStringProperty, display: strings.factors.threeStringProperty },
      ],
      new DerivedProperty([a11y.factorGroupPatternStringProperty], (pattern) =>
        StringUtils.fillIn(pattern, { number }),
      ),
      STEP_CARD_NODE_SETTINGS.FACTOR_RADIO_GROUP_MAX_WIDTH,
      "horizontal",
    );

    // Title, equation and ΔH on one line, ΔH against the card's right edge.
    const contentWidth = width - 24;
    const topRow = new Node({ children: [title, equation, enthalpy] });
    const layoutTopRow = () => {
      title.left = 0;
      equation.left = TITLE_WIDTH + STEP_CARD_NODE_SETTINGS.LAYOUT_TOP_ROW_LEFT_OFFSET;
      enthalpy.right = contentWidth;
      title.centerY = equation.centerY = enthalpy.centerY = 0;
    };
    for (const node of [title, equation, enthalpy]) {
      node.boundsProperty.link(layoutTopRow);
    }
    super(
      new VBox({
        align: "left",
        spacing: STEP_CARD_NODE_SETTINGS.CONSTRUCTOR_SPACING,
        children: [
          topRow,
          new HBox({ spacing: STEP_CARD_NODE_SETTINGS.ITEM_2_SPACING, children: [reverseCheckbox, factorRadio] }),
        ],
      }),
      {
        minWidth: width,
        maxWidth: width,
        visibleProperty: new DerivedProperty([model.puzzleProperty], (puzzle) => index < puzzle.steps.length),
      },
    );
    this.reverseCheckbox = reverseCheckbox;
    this.factorRadio = factorRadio;
  }
}
