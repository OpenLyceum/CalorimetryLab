import { COFFEE_CUP_APPARATUS_NODE_SETTINGS } from "../../CalorimetryLabConstants.js";
/**
 * CoffeeCupApparatusNode.ts
 *
 * The bench of the Coffee Cup screen: a lidded coffee-cup calorimeter with a thermometer and a
 * stirrer, and beside it what goes in: a beaker of NaOH solution, a weighing boat of salt, or a
 * strip of magnesium ribbon. Mixing empties the beaker or boat into the cup; a salt's crystals
 * and the magnesium shrink as the reaction runs, and hydrogen bubbles rise from the magnesium.
 * The solution is tinted warm or cool as its temperature changes.
 */

import { Multilink } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Node, Path, Rectangle, RichText } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import CalorimetryLabColors from "../../CalorimetryLabColors.js";
import { FONT_SIZE } from "../../CalorimetryLabConstants.js";
import { FoamCupNode } from "../../common/view/FoamCupNode.js";
import { liquidTint } from "../../common/view/liquidTint.js";
import { ThermometerReadoutNode } from "../../common/view/ThermometerReadoutNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { CoffeeCupModel } from "../model/CoffeeCupModel.js";
import type { CoffeeCupReaction } from "../model/CoffeeCupReactions.js";

const CUP_LEFT: number = COFFEE_CUP_APPARATUS_NODE_SETTINGS.CUP_LEFT;
const CUP_TOP: number = COFFEE_CUP_APPARATUS_NODE_SETTINGS.CUP_TOP;
const CUP_WIDTH: number = COFFEE_CUP_APPARATUS_NODE_SETTINGS.CUP_WIDTH;
const CUP_HEIGHT: number = COFFEE_CUP_APPARATUS_NODE_SETTINGS.CUP_HEIGHT;
/** Volume that fills the cup to the brim (mL). */
const CUP_CAPACITY: number = COFFEE_CUP_APPARATUS_NODE_SETTINGS.CUP_CAPACITY;
const BEAKER_LEFT: number = COFFEE_CUP_APPARATUS_NODE_SETTINGS.BEAKER_LEFT;
const BEAKER_TOP: number = COFFEE_CUP_APPARATUS_NODE_SETTINGS.BEAKER_TOP;
const BEAKER_WIDTH: number = COFFEE_CUP_APPARATUS_NODE_SETTINGS.BEAKER_WIDTH;
const BEAKER_HEIGHT: number = COFFEE_CUP_APPARATUS_NODE_SETTINGS.BEAKER_HEIGHT;
/** Volume that fills the beaker (mL). */
const BEAKER_CAPACITY: number = COFFEE_CUP_APPARATUS_NODE_SETTINGS.BEAKER_CAPACITY;
const BUBBLE_COUNT: number = COFFEE_CUP_APPARATUS_NODE_SETTINGS.BUBBLE_COUNT;
const BUBBLE_SPEED: number = COFFEE_CUP_APPARATUS_NODE_SETTINGS.BUBBLE_SPEED;

export class CoffeeCupApparatusNode extends Node {
  private readonly model: CoffeeCupModel;
  private readonly stirrer: Node;
  private readonly bubbles: Circle[];
  private readonly bubbleLayer: Node;
  private readonly cup: FoamCupNode;
  private readonly layoutCallback: () => void;
  private stirPhase = 0;

  public constructor(model: CoffeeCupModel) {
    super();
    this.model = model;
    const common = StringManager.getInstance().getCommonStrings();
    const formulaOptions = {
      font: new PhetFont(FONT_SIZE.small),
      fill: CalorimetryLabColors.mutedTextColorProperty,
      maxWidth: COFFEE_CUP_APPARATUS_NODE_SETTINGS.FORMULA_OPTIONS_MAX_WIDTH,
    };

    // ── Cup, stirrer, thermometer ──────────────────────────────────────────────
    this.cup = new FoamCupNode(CUP_WIDTH, CUP_HEIGHT, true);
    this.cup.translation = new Vector2(CUP_LEFT, CUP_TOP);
    const cupLabel = new RichText("", formulaOptions);

    this.stirrer = new Node({
      children: [
        new Rectangle(
          COFFEE_CUP_APPARATUS_NODE_SETTINGS.STIRRER_X,
          COFFEE_CUP_APPARATUS_NODE_SETTINGS.STIRRER_Y,
          COFFEE_CUP_APPARATUS_NODE_SETTINGS.STIRRER_WIDTH,
          CUP_HEIGHT + 30,
          { fill: CalorimetryLabColors.steelColorProperty },
        ),
        new Path(
          new Shape().ellipse(
            0,
            CUP_HEIGHT - 12,
            COFFEE_CUP_APPARATUS_NODE_SETTINGS.STIRRER_RADIUS_X,
            COFFEE_CUP_APPARATUS_NODE_SETTINGS.STIRRER_RADIUS_Y,
            0,
          ),
          {
            stroke: CalorimetryLabColors.steelColorProperty,
            lineWidth: COFFEE_CUP_APPARATUS_NODE_SETTINGS.STIRRER_LINE_WIDTH,
          },
        ),
      ],
      x: CUP_LEFT + CUP_WIDTH * COFFEE_CUP_APPARATUS_NODE_SETTINGS.CONSTRUCTOR_X_FACTOR,
      y: CUP_TOP,
    });
    const thermometer = new ThermometerReadoutNode(model.temperatureProperty, {
      minTemperature: 0,
      maxTemperature: 50,
      decimals: 2,
      tubeHeight: 140,
    });
    thermometer.centerX = CUP_LEFT + CUP_WIDTH * COFFEE_CUP_APPARATUS_NODE_SETTINGS.CONSTRUCTOR_CENTER_X_FACTOR;
    thermometer.bottom = CUP_TOP + CUP_HEIGHT - COFFEE_CUP_APPARATUS_NODE_SETTINGS.CONSTRUCTOR_BOTTOM_OFFSET;

    // ── What goes in ────────────────────────────────────────────────────────────
    const beakerLiquid = new Rectangle(0, 0, BEAKER_WIDTH, COFFEE_CUP_APPARATUS_NODE_SETTINGS.BEAKER_LIQUID_HEIGHT, {
      fill: CalorimetryLabColors.waterColorProperty,
    });
    const beaker = new Node({
      children: [
        beakerLiquid,
        new Path(
          new Shape().moveTo(0, 0).lineTo(0, BEAKER_HEIGHT).lineTo(BEAKER_WIDTH, BEAKER_HEIGHT).lineTo(BEAKER_WIDTH, 0),
          {
            stroke: CalorimetryLabColors.glassColorProperty,
            lineWidth: COFFEE_CUP_APPARATUS_NODE_SETTINGS.BEAKER_LINE_WIDTH,
          },
        ),
      ],
      x: BEAKER_LEFT,
      y: BEAKER_TOP,
    });
    const boat = new Node({
      children: [
        new Path(
          new Shape()
            .moveTo(0, 0)
            .lineTo(COFFEE_CUP_APPARATUS_NODE_SETTINGS.BOAT_X, 0)
            .lineTo(COFFEE_CUP_APPARATUS_NODE_SETTINGS.BOAT_X_SEGMENT_2, COFFEE_CUP_APPARATUS_NODE_SETTINGS.BOAT_Y)
            .lineTo(COFFEE_CUP_APPARATUS_NODE_SETTINGS.BOAT_X_SEGMENT_3, COFFEE_CUP_APPARATUS_NODE_SETTINGS.BOAT_Y)
            .close(),
          {
            fill: CalorimetryLabColors.foamColorProperty,
            stroke: CalorimetryLabColors.foamEdgeColorProperty,
          },
        ),
      ],
      x: BEAKER_LEFT - COFFEE_CUP_APPARATUS_NODE_SETTINGS.BOAT_X_OFFSET,
      y: BEAKER_TOP + BEAKER_HEIGHT - COFFEE_CUP_APPARATUS_NODE_SETTINGS.BOAT_Y_OFFSET,
    });
    const crystalPile = new Path(null, {
      fill: CalorimetryLabColors.solidColorProperty,
      stroke: CalorimetryLabColors.solidEdgeColorProperty,
    });
    const ribbon = new Rectangle(
      0,
      0,
      COFFEE_CUP_APPARATUS_NODE_SETTINGS.RIBBON_WIDTH,
      COFFEE_CUP_APPARATUS_NODE_SETTINGS.RIBBON_HEIGHT,
      1,
      1,
      {
        fill: CalorimetryLabColors.steelColorProperty,
        stroke: CalorimetryLabColors.steelDarkColorProperty,
      },
    );
    const sideLabel = new RichText("", formulaOptions);

    // Solid inside the cup after mixing (crystals settle, the ribbon sinks).
    const solidInCup = new Path(null, {
      fill: CalorimetryLabColors.solidColorProperty,
      stroke: CalorimetryLabColors.solidEdgeColorProperty,
    });
    const ribbonInCup = new Rectangle(
      0,
      0,
      COFFEE_CUP_APPARATUS_NODE_SETTINGS.RIBBON_IN_CUP_WIDTH,
      COFFEE_CUP_APPARATUS_NODE_SETTINGS.RIBBON_IN_CUP_HEIGHT,
      1,
      1,
      {
        fill: CalorimetryLabColors.steelColorProperty,
        stroke: CalorimetryLabColors.steelDarkColorProperty,
      },
    );

    this.bubbles = Array.from({ length: BUBBLE_COUNT }, (_, i) => {
      const bubble = new Circle(2 + (i % 3), {
        stroke: CalorimetryLabColors.solidColorProperty,
        lineWidth: 1,
      });
      bubble.x = CUP_LEFT + CUP_WIDTH * 0.5 + ((i * 37) % 30) - COFFEE_CUP_APPARATUS_NODE_SETTINGS.CONSTRUCTOR_X_OFFSET;
      bubble.y =
        CUP_TOP +
        CUP_HEIGHT -
        COFFEE_CUP_APPARATUS_NODE_SETTINGS.CONSTRUCTOR_Y_OFFSET -
        ((i * COFFEE_CUP_APPARATUS_NODE_SETTINGS.CONSTRUCTOR_Y_FACTOR) % 80);
      return bubble;
    });
    this.bubbleLayer = new Node({ children: this.bubbles, visible: false });

    const pileShape = (width: number, height: number) =>
      new Shape()
        .moveTo(-width / 2, 0)
        .quadraticCurveTo(0, -2 * height, width / 2, 0)
        .close();

    // ── Layout as the reaction, amounts and progress change ─────────────────────
    const layout = () => {
      const reaction: CoffeeCupReaction = model.reactionProperty.value;
      const ready = model.phaseProperty.value === "ready";
      const progress = model.progressProperty.value;
      const kind = reaction.kind;

      // Liquid in the cup.
      const cupVolume =
        kind === "neutralization"
          ? model.acidVolumeProperty.value + (ready ? 0 : model.baseVolumeProperty.value)
          : kind === "metalAcid"
            ? model.acidVolumeProperty.value
            : model.waterVolumeProperty.value;
      const deltaT = model.temperatureProperty.value - model.initialTemperatureProperty.value;
      this.cup.setLiquid(cupVolume / CUP_CAPACITY, liquidTint(deltaT, 8));
      const surface = CUP_TOP + this.cup.surfaceY(cupVolume / CUP_CAPACITY);
      const bottom = CUP_TOP + this.cup.bottomY;

      // Beaker of base.
      beaker.visible = kind === "neutralization" && ready;
      const baseHeight = (BEAKER_HEIGHT * model.baseVolumeProperty.value) / BEAKER_CAPACITY;
      beakerLiquid.setRect(0, BEAKER_HEIGHT - baseHeight, BEAKER_WIDTH, baseHeight);

      // Boat with salt or magnesium.
      boat.visible = kind !== "neutralization";
      const soluteSize = Math.sqrt(model.soluteMassProperty.value) * 14;
      crystalPile.shape = pileShape(soluteSize * 1.6, soluteSize * 0.45);
      crystalPile.translation = new Vector2(BEAKER_LEFT + 45, BEAKER_TOP + BEAKER_HEIGHT - 14);
      crystalPile.visible = kind === "dissolution" && ready;
      ribbon.setRect(0, 0, 30 + 100 * model.metalMassProperty.value, 5, 1, 1);
      ribbon.centerX = BEAKER_LEFT + COFFEE_CUP_APPARATUS_NODE_SETTINGS.LAYOUT_CENTER_X_OFFSET;
      ribbon.bottom = BEAKER_TOP + BEAKER_HEIGHT - COFFEE_CUP_APPARATUS_NODE_SETTINGS.LAYOUT_BOTTOM_OFFSET;
      ribbon.visible = kind === "metalAcid" && ready;

      const remaining = 1 - progress;
      solidInCup.visible = kind === "dissolution" && !ready && remaining > 0.01;
      solidInCup.shape = pileShape(soluteSize * 1.4 * Math.sqrt(remaining), soluteSize * 0.35 * Math.sqrt(remaining));
      solidInCup.translation = new Vector2(CUP_LEFT + CUP_WIDTH * 0.45, bottom);
      // Excess magnesium (when the acid is limiting) stays behind.
      const leftover = 1 - progress * reactionMolesFraction(model);
      ribbonInCup.visible = kind === "metalAcid" && !ready && leftover > 0.01;
      ribbonInCup.setRect(0, 0, (30 + 100 * model.metalMassProperty.value) * Math.max(leftover, 0.01), 5, 1, 1);
      ribbonInCup.centerX = CUP_LEFT + CUP_WIDTH * COFFEE_CUP_APPARATUS_NODE_SETTINGS.LAYOUT_CENTER_X_FACTOR;
      ribbonInCup.bottom = bottom - 2;
      this.bubbleLayer.visible = kind === "metalAcid" && !ready && progress < 0.98;
      for (const bubble of this.bubbles) {
        bubble.visible = bubble.y > surface + 4;
      }

      // Labels.
      cupLabel.string = ready
        ? kind === "dissolution"
          ? "H<sub>2</sub>O(l)"
          : "HCl(aq)"
        : common.solutionStringProperty.value;
      cupLabel.centerX = CUP_LEFT + CUP_WIDTH / 2;
      cupLabel.top = CUP_TOP + CUP_HEIGHT + COFFEE_CUP_APPARATUS_NODE_SETTINGS.LAYOUT_TOP_OFFSET;
      sideLabel.visible = ready;
      sideLabel.string = kind === "neutralization" ? "NaOH(aq)" : `${reaction.perMoleOf}(s)`;
      sideLabel.centerX = BEAKER_LEFT + BEAKER_WIDTH / 2;
      sideLabel.top = BEAKER_TOP + BEAKER_HEIGHT + COFFEE_CUP_APPARATUS_NODE_SETTINGS.CONSTRUCTOR_LAYOUT_TOP_OFFSET;
    };
    Multilink.multilinkAny(
      [
        model.reactionProperty,
        model.phaseProperty,
        model.progressProperty,
        model.temperatureProperty,
        model.acidVolumeProperty,
        model.baseVolumeProperty,
        model.waterVolumeProperty,
        model.soluteMassProperty,
        model.metalMassProperty,
        common.solutionStringProperty,
        CalorimetryLabColors.waterColorProperty,
        CalorimetryLabColors.exothermicColorProperty,
        CalorimetryLabColors.endothermicColorProperty,
      ],
      layout,
    );
    this.layoutCallback = layout;

    this.children = [
      beaker,
      boat,
      crystalPile,
      ribbon,
      sideLabel,
      this.cup,
      solidInCup,
      ribbonInCup,
      this.bubbleLayer,
      this.stirrer,
      thermometer,
      cupLabel,
    ];
  }

  /** Stirs while a trial runs and lets the hydrogen bubbles rise. */
  public step(dt: number): void {
    if (this.model.phaseProperty.value !== "running") {
      return;
    }
    this.stirPhase += dt * 6;
    this.stirrer.y =
      CUP_TOP -
      COFFEE_CUP_APPARATUS_NODE_SETTINGS.STEP_Y_OFFSET +
      COFFEE_CUP_APPARATUS_NODE_SETTINGS.STEP_Y_FACTOR * Math.sin(this.stirPhase);
    if (this.bubbleLayer.visible) {
      const surface = CUP_TOP + this.cup.surfaceY(this.model.acidVolumeProperty.value / CUP_CAPACITY);
      for (const bubble of this.bubbles) {
        bubble.y -= BUBBLE_SPEED * dt;
        if (bubble.y < surface + 4) {
          bubble.y = CUP_TOP + this.cup.bottomY - COFFEE_CUP_APPARATUS_NODE_SETTINGS.STEP_Y_OFFSET;
        }
      }
      this.layoutCallback();
    }
  }
}

/** Fraction of the magnesium that reacts when the reaction is complete (less than 1 if the acid runs out). */
function reactionMolesFraction(model: CoffeeCupModel): number {
  const trial = model.trialProperty.value;
  if (!trial || trial.metalMass <= 0) {
    return 1;
  }
  const metalMoles = trial.metalMass / trial.reaction.molarMass;
  const acidMoles = (trial.acidVolume / 1000) * trial.acidConcentration;
  return Math.min(1, acidMoles / 2 / metalMoles);
}
