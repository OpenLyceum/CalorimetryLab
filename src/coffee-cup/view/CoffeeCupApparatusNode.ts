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

const CUP_LEFT = 150;
const CUP_TOP = 110;
const CUP_WIDTH = 140;
const CUP_HEIGHT = 140;
/** Volume that fills the cup to the brim (mL). */
const CUP_CAPACITY = 230;
const BEAKER_LEFT = 10;
const BEAKER_TOP = 160;
const BEAKER_WIDTH = 90;
const BEAKER_HEIGHT = 90;
/** Volume that fills the beaker (mL). */
const BEAKER_CAPACITY = 120;
const BUBBLE_COUNT = 10;
const BUBBLE_SPEED = 45;

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
      maxWidth: 130,
    };

    // ── Cup, stirrer, thermometer ──────────────────────────────────────────────
    this.cup = new FoamCupNode(CUP_WIDTH, CUP_HEIGHT, true);
    this.cup.translation = new Vector2(CUP_LEFT, CUP_TOP);
    const cupLabel = new RichText("", formulaOptions);

    this.stirrer = new Node({
      children: [
        new Rectangle(-1.5, -40, 3, CUP_HEIGHT + 30, { fill: CalorimetryLabColors.steelColorProperty }),
        new Path(new Shape().ellipse(0, CUP_HEIGHT - 12, 18, 5, 0), {
          stroke: CalorimetryLabColors.steelColorProperty,
          lineWidth: 3,
        }),
      ],
      x: CUP_LEFT + CUP_WIDTH * 0.35,
      y: CUP_TOP,
    });
    const thermometer = new ThermometerReadoutNode(model.temperatureProperty, {
      minTemperature: 0,
      maxTemperature: 50,
      decimals: 2,
      tubeHeight: 140,
    });
    thermometer.centerX = CUP_LEFT + CUP_WIDTH * 0.7;
    thermometer.bottom = CUP_TOP + CUP_HEIGHT - 16;

    // ── What goes in ────────────────────────────────────────────────────────────
    const beakerLiquid = new Rectangle(0, 0, BEAKER_WIDTH, 10, { fill: CalorimetryLabColors.waterColorProperty });
    const beaker = new Node({
      children: [
        beakerLiquid,
        new Path(
          new Shape().moveTo(0, 0).lineTo(0, BEAKER_HEIGHT).lineTo(BEAKER_WIDTH, BEAKER_HEIGHT).lineTo(BEAKER_WIDTH, 0),
          { stroke: CalorimetryLabColors.glassColorProperty, lineWidth: 2.5 },
        ),
      ],
      x: BEAKER_LEFT,
      y: BEAKER_TOP,
    });
    const boat = new Node({
      children: [
        new Path(new Shape().moveTo(0, 0).lineTo(100, 0).lineTo(85, 14).lineTo(15, 14).close(), {
          fill: CalorimetryLabColors.foamColorProperty,
          stroke: CalorimetryLabColors.foamEdgeColorProperty,
        }),
      ],
      x: BEAKER_LEFT - 5,
      y: BEAKER_TOP + BEAKER_HEIGHT - 14,
    });
    const crystalPile = new Path(null, {
      fill: CalorimetryLabColors.solidColorProperty,
      stroke: CalorimetryLabColors.solidEdgeColorProperty,
    });
    const ribbon = new Rectangle(0, 0, 60, 5, 1, 1, {
      fill: CalorimetryLabColors.steelColorProperty,
      stroke: CalorimetryLabColors.steelDarkColorProperty,
    });
    const sideLabel = new RichText("", formulaOptions);

    // Solid inside the cup after mixing (crystals settle, the ribbon sinks).
    const solidInCup = new Path(null, {
      fill: CalorimetryLabColors.solidColorProperty,
      stroke: CalorimetryLabColors.solidEdgeColorProperty,
    });
    const ribbonInCup = new Rectangle(0, 0, 50, 5, 1, 1, {
      fill: CalorimetryLabColors.steelColorProperty,
      stroke: CalorimetryLabColors.steelDarkColorProperty,
    });

    this.bubbles = Array.from({ length: BUBBLE_COUNT }, (_, i) => {
      const bubble = new Circle(2 + (i % 3), {
        stroke: CalorimetryLabColors.solidColorProperty,
        lineWidth: 1,
      });
      bubble.x = CUP_LEFT + CUP_WIDTH * 0.5 + ((i * 37) % 30) - 15;
      bubble.y = CUP_TOP + CUP_HEIGHT - 20 - ((i * 53) % 80);
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
      ribbon.centerX = BEAKER_LEFT + 45;
      ribbon.bottom = BEAKER_TOP + BEAKER_HEIGHT - 14;
      ribbon.visible = kind === "metalAcid" && ready;

      const remaining = 1 - progress;
      solidInCup.visible = kind === "dissolution" && !ready && remaining > 0.01;
      solidInCup.shape = pileShape(soluteSize * 1.4 * Math.sqrt(remaining), soluteSize * 0.35 * Math.sqrt(remaining));
      solidInCup.translation = new Vector2(CUP_LEFT + CUP_WIDTH * 0.45, bottom);
      // Excess magnesium (when the acid is limiting) stays behind.
      const leftover = 1 - progress * reactionMolesFraction(model);
      ribbonInCup.visible = kind === "metalAcid" && !ready && leftover > 0.01;
      ribbonInCup.setRect(0, 0, (30 + 100 * model.metalMassProperty.value) * Math.max(leftover, 0.01), 5, 1, 1);
      ribbonInCup.centerX = CUP_LEFT + CUP_WIDTH * 0.45;
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
      cupLabel.top = CUP_TOP + CUP_HEIGHT + 18;
      sideLabel.visible = ready;
      sideLabel.string = kind === "neutralization" ? "NaOH(aq)" : `${reaction.perMoleOf}(s)`;
      sideLabel.centerX = BEAKER_LEFT + BEAKER_WIDTH / 2;
      sideLabel.top = BEAKER_TOP + BEAKER_HEIGHT + 8;
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
    this.stirrer.y = CUP_TOP - 6 + 6 * Math.sin(this.stirPhase);
    if (this.bubbleLayer.visible) {
      const surface = CUP_TOP + this.cup.surfaceY(this.model.acidVolumeProperty.value / CUP_CAPACITY);
      for (const bubble of this.bubbles) {
        bubble.y -= BUBBLE_SPEED * dt;
        if (bubble.y < surface + 4) {
          bubble.y = CUP_TOP + this.cup.bottomY - 6;
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
