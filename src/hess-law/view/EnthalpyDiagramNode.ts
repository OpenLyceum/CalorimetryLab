/**
 * EnthalpyDiagramNode.ts
 *
 * An enthalpy ladder. The Hess route starts at the target's reactants (H = 0) and climbs or drops
 * by each step's ΔH in turn, one column per step; once the steps solve the puzzle, a target arrow
 * from the start to the end shows ΔH of the target is their sum. The formation route instead goes
 * reactants → elements (H = 0) → products using enthalpies of formation, with the overall arrow
 * beside it. Upward (endothermic) and downward (exothermic) arrows are coloured differently.
 */

import { Multilink } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { Line, Node, RichText, type TColor, Text } from "scenerystack/scenery";
import { ArrowNode, PhetFont } from "scenerystack/scenery-phet";
import CalorimetryLabColors from "../../CalorimetryLabColors.js";
import { FONT_SIZE } from "../../CalorimetryLabConstants.js";
import { disposeChildren } from "../../common/view/disposeChildren.js";
import { formatEnthalpy } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { HessLawModel } from "../model/HessLawModel.js";

const MIN_SPAN = 60;
const LEVEL_WIDTH = 46;
const LABEL_FONT = new PhetFont(FONT_SIZE.tiny);

type Level = { readonly enthalpy: number; readonly column: number; readonly label?: string };
type Arrow = {
  readonly from: number;
  readonly to: number;
  readonly column: number;
  readonly label: string;
  readonly target?: boolean;
};

export class EnthalpyDiagramNode extends Node {
  private readonly content = new Node();

  public constructor(model: HessLawModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getHessLawStrings();
    const axis = new Line(0, 0, 0, height, { stroke: CalorimetryLabColors.chartAxisColorProperty });
    const axisLabel = new Text(strings.enthalpyAxisStringProperty, {
      font: new PhetFont(FONT_SIZE.small),
      fill: CalorimetryLabColors.mutedTextColorProperty,
      rotation: -Math.PI / 2,
      maxWidth: height,
    });
    axisLabel.boundsProperty.link(() => {
      axisLabel.right = -4;
      axisLabel.centerY = height / 2;
    });
    this.children = [axis, axisLabel, this.content];

    Multilink.multilinkAny(
      [
        model.usedStepsProperty,
        model.solvedProperty,
        model.formationRouteProperty,
        strings.startStringProperty,
        strings.endStringProperty,
        strings.elementsStringProperty,
        strings.arrowPatternStringProperty,
        strings.stepArrowLabelPatternStringProperty,
        strings.targetArrowLabelStringProperty,
      ],
      () => {
        const puzzle = model.puzzleProperty.value;
        const levels: Level[] = [];
        const arrows: Arrow[] = [];
        const arrowLabel = (label: string, value: number) =>
          StringUtils.fillIn(strings.arrowPatternStringProperty.value, { label, value: formatEnthalpy(value) });
        let columns: number;
        if (model.formationRouteProperty.value) {
          const reactants = puzzle.target.reactantFormationEnthalpy();
          const products = puzzle.target.productFormationEnthalpy();
          columns = 3;
          levels.push(
            { enthalpy: reactants, column: 0, label: strings.startStringProperty.value },
            { enthalpy: 0, column: 1, label: strings.elementsStringProperty.value },
            { enthalpy: products, column: 2, label: strings.endStringProperty.value },
          );
          arrows.push(
            { from: reactants, to: 0, column: 0.5, label: arrowLabel("−ΣνΔHf°", -reactants) },
            { from: 0, to: products, column: 1.5, label: arrowLabel("ΣνΔHf°", products) },
            {
              from: reactants,
              to: products,
              column: 2.5,
              label: arrowLabel(strings.targetArrowLabelStringProperty.value, products - reactants),
              target: true,
            },
          );
        } else {
          const steps = model.usedStepsProperty.value;
          columns = steps.length + 1;
          let enthalpy = 0;
          levels.push({ enthalpy, column: 0, label: strings.startStringProperty.value });
          steps.forEach((step, i) => {
            const next = enthalpy + step.enthalpy;
            const label = StringUtils.fillIn(strings.stepArrowLabelPatternStringProperty.value, { number: i + 1 });
            arrows.push({ from: enthalpy, to: next, column: i + 0.5, label: arrowLabel(label, step.enthalpy) });
            enthalpy = next;
            levels.push({
              enthalpy,
              column: i + 1,
              ...(i === steps.length - 1 && model.solvedProperty.value
                ? { label: strings.endStringProperty.value }
                : {}),
            });
          });
          if (model.solvedProperty.value) {
            arrows.push({
              from: 0,
              to: enthalpy,
              column: steps.length + 0.5,
              label: arrowLabel(strings.targetArrowLabelStringProperty.value, enthalpy),
              target: true,
            });
            columns += 1;
          }
        }
        this.draw(levels, arrows, columns, width, height);
      },
    );
  }

  private draw(
    levels: readonly Level[],
    arrows: readonly Arrow[],
    columns: number,
    width: number,
    height: number,
  ): void {
    disposeChildren(this.content);
    const values = [0, ...levels.map((l) => l.enthalpy)];
    const low = Math.min(...values);
    const high = Math.max(...values);
    const middle = (low + high) / 2;
    const half = Math.max(MIN_SPAN, (high - low) * 1.25) / 2;
    const y = (enthalpy: number) => height * (1 - (enthalpy - (middle - half)) / (2 * half));
    const columnWidth = (width - 20) / Math.max(columns, 1);
    const x = (column: number) => 20 + columnWidth * (column + 0.5);

    for (const level of levels) {
      const cx = x(level.column);
      this.content.addChild(
        new Line(cx - LEVEL_WIDTH / 2, y(level.enthalpy), cx + LEVEL_WIDTH / 2, y(level.enthalpy), {
          stroke: CalorimetryLabColors.levelLineColorProperty,
          lineWidth: 2,
        }),
      );
      if (level.label) {
        const text = new Text(level.label, {
          font: LABEL_FONT,
          fill: CalorimetryLabColors.textColorProperty,
          maxWidth: columnWidth,
        });
        text.centerX = cx;
        text.bottom = y(level.enthalpy) - 3;
        this.content.addChild(text);
      }
    }
    // Dashed guides joining each level to the next column's start.
    for (let i = 0; i < levels.length - 1; i++) {
      const level = levels[i] as Level;
      const next = levels[i + 1] as Level;
      this.content.addChild(
        new Line(
          x(level.column) + LEVEL_WIDTH / 2,
          y(level.enthalpy),
          x(next.column) - LEVEL_WIDTH / 2,
          y(level.enthalpy),
          {
            stroke: CalorimetryLabColors.levelLineColorProperty,
            lineDash: [3, 3],
          },
        ),
      );
    }
    for (const arrow of arrows) {
      if (Math.abs(arrow.to - arrow.from) < 0.05) {
        continue;
      }
      const ax = x(arrow.column);
      const color: TColor = arrow.target
        ? CalorimetryLabColors.targetColorProperty
        : arrow.to < arrow.from
          ? CalorimetryLabColors.exothermicColorProperty
          : CalorimetryLabColors.endothermicColorProperty;
      const length = Math.abs(y(arrow.to) - y(arrow.from));
      const head = Math.min(10, length * 0.4);
      this.content.addChild(
        new ArrowNode(ax, y(arrow.from), ax, y(arrow.to), {
          fill: color,
          stroke: null,
          headHeight: head,
          headWidth: 10,
          tailWidth: 3,
        }),
      );
      const text = new RichText(arrow.label, {
        font: LABEL_FONT,
        fill: color,
        maxWidth: height * 0.8,
        rotation: -Math.PI / 2,
      });
      text.centerY = (y(arrow.from) + y(arrow.to)) / 2;
      text.left = ax + 6;
      this.content.addChild(text);
    }
  }
}
