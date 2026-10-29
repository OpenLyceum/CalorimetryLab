/**
 * SpecificHeatApparatusNode.ts
 *
 * The bench of the Specific Heat screen: a beaker of hot water on a hot plate with the sample
 * hanging in it, and an insulated cup of water with a thermometer. Dropping the sample swings it
 * from the bath into the cup; while it is hotter than the water, arrows show heat leaving it. A
 * tag on the block reads the sample's temperature. The block's size follows its volume (mass over
 * density), so 50 g of aluminum is visibly bigger than 50 g of lead.
 */

import { DerivedProperty, Multilink } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { StringUtils } from "scenerystack/phetcommon";
import { Node, Path, type ProfileColorProperty, Rectangle, Text } from "scenerystack/scenery";
import { ArrowNode, PhetFont } from "scenerystack/scenery-phet";
import CalorimetryLabColors from "../../CalorimetryLabColors.js";
import { FONT_SIZE, WATER_MASS_RANGE } from "../../CalorimetryLabConstants.js";
import { FoamCupNode } from "../../common/view/FoamCupNode.js";
import { fixed } from "../../common/view/formatValues.js";
import { liquidTint } from "../../common/view/liquidTint.js";
import { ThermometerReadoutNode } from "../../common/view/ThermometerReadoutNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { Sample, SampleId } from "../model/Samples.js";
import type { SpecificHeatModel } from "../model/SpecificHeatModel.js";

/** Pixels per centimetre for the sample block. */
const BLOCK_SCALE = 11;
const BATH_LEFT = 0;
const BATH_TOP = 120;
const BATH_WIDTH = 120;
const BATH_HEIGHT = 130;
const BATH_WATER_TOP = BATH_TOP + 22;
const CUP_LEFT = 170;
const CUP_TOP = 120;
const CUP_WIDTH = 140;
const CUP_HEIGHT = 150;
const DROP_DURATION = 0.6;

const SAMPLE_COLORS: Readonly<Record<SampleId, ProfileColorProperty>> = {
  aluminum: CalorimetryLabColors.aluminumColorProperty,
  iron: CalorimetryLabColors.ironColorProperty,
  copper: CalorimetryLabColors.copperColorProperty,
  silver: CalorimetryLabColors.silverColorProperty,
  lead: CalorimetryLabColors.leadColorProperty,
  unknownA: CalorimetryLabColors.unknownColorProperty,
  unknownB: CalorimetryLabColors.unknownColorProperty,
};

export class SpecificHeatApparatusNode extends Node {
  private readonly model: SpecificHeatModel;
  private readonly sampleNode: Node;
  private readonly block: Rectangle;
  private readonly arrows: ArrowNode[];
  private readonly arrowLayer: Node;
  private readonly cup: FoamCupNode;
  private dropProgress = 0;

  public constructor(model: SpecificHeatModel) {
    super();
    this.model = model;
    const strings = StringManager.getInstance().getSpecificHeatStrings();
    const common = StringManager.getInstance().getCommonStrings();
    const labelOptions = { font: new PhetFont(FONT_SIZE.small), fill: CalorimetryLabColors.mutedTextColorProperty };

    // ── Bath on a hot plate ─────────────────────────────────────────────────────
    const hotPlate = new Node({
      children: [
        new Rectangle(BATH_LEFT - 10, BATH_TOP + BATH_HEIGHT, BATH_WIDTH + 20, 18, 3, 3, {
          fill: CalorimetryLabColors.hotPlateColorProperty,
        }),
        new Rectangle(BATH_LEFT + 10, BATH_TOP + BATH_HEIGHT + 2, BATH_WIDTH - 20, 4, {
          fill: CalorimetryLabColors.hotPlateGlowColorProperty,
        }),
      ],
    });
    const bathWater = new Rectangle(BATH_LEFT, BATH_WATER_TOP, BATH_WIDTH, BATH_TOP + BATH_HEIGHT - BATH_WATER_TOP, {
      fill: CalorimetryLabColors.hotWaterColorProperty,
    });
    const bathGlass = new Path(
      new Shape()
        .moveTo(BATH_LEFT, BATH_TOP)
        .lineTo(BATH_LEFT, BATH_TOP + BATH_HEIGHT)
        .lineTo(BATH_LEFT + BATH_WIDTH, BATH_TOP + BATH_HEIGHT)
        .lineTo(BATH_LEFT + BATH_WIDTH, BATH_TOP),
      { stroke: CalorimetryLabColors.glassColorProperty, lineWidth: 2.5 },
    );
    const bathLabel = new Text(strings.bathStringProperty, { ...labelOptions, maxWidth: BATH_WIDTH + 30 });
    bathLabel.boundsProperty.link(() => {
      bathLabel.centerX = BATH_LEFT + BATH_WIDTH / 2;
      bathLabel.top = BATH_TOP + BATH_HEIGHT + 22;
    });

    // ── Cup with a thermometer ──────────────────────────────────────────────────
    this.cup = new FoamCupNode(CUP_WIDTH, CUP_HEIGHT, false);
    this.cup.translation = new Vector2(CUP_LEFT, CUP_TOP);
    const thermometer = new ThermometerReadoutNode(model.waterTemperatureProperty, {
      minTemperature: 0,
      maxTemperature: 100,
      decimals: 2,
      tubeHeight: 150,
      label: common.waterStringProperty,
    });
    thermometer.centerX = CUP_LEFT + CUP_WIDTH * 0.78;
    thermometer.bottom = CUP_TOP + CUP_HEIGHT - 18;
    const cupLabel = new Text(strings.cupStringProperty, { ...labelOptions, maxWidth: CUP_WIDTH + 20 });
    cupLabel.boundsProperty.link(() => {
      cupLabel.centerX = CUP_LEFT + CUP_WIDTH / 2;
      cupLabel.top = CUP_TOP + CUP_HEIGHT + 22;
    });

    // ── Sample with its temperature tag ────────────────────────────────────────
    this.block = new Rectangle(0, 0, 10, 10, 2, 2, { stroke: CalorimetryLabColors.steelDarkColorProperty });
    const string = new Path(new Shape().moveTo(0, 0).lineTo(0, -70), {
      stroke: CalorimetryLabColors.mutedTextColorProperty,
      lineWidth: 1,
    });
    const tagText = new Text(
      new DerivedProperty(
        [model.sampleTemperatureProperty, common.celsiusPatternStringProperty],
        (temperature, pattern) => StringUtils.fillIn(pattern, { value: fixed(temperature, 1) }),
      ),
      {
        font: new PhetFont({ size: FONT_SIZE.tiny, family: "monospace" }),
        fill: CalorimetryLabColors.textColorProperty,
      },
    );
    const tagBackground = new Rectangle(0, 0, 58, 16, 3, 3, {
      fill: CalorimetryLabColors.readoutBackgroundColorProperty,
      stroke: CalorimetryLabColors.sampleTraceColorProperty,
    });
    const tag = new Node({ children: [tagBackground, tagText] });
    tagText.boundsProperty.link(() => {
      tagText.center = tagBackground.center;
    });
    this.sampleNode = new Node({ children: [string, this.block, tag] });
    Multilink.multilink([model.sampleProperty, model.sampleMassProperty], (sample: Sample, mass) => {
      const side = Math.max(10, BLOCK_SCALE * Math.cbrt(mass / sample.density));
      this.block.setRect(-side / 2, -side / 2, side, side, 2, 2);
      this.block.fill = SAMPLE_COLORS[sample.id];
      string.shape = new Shape().moveTo(0, -side / 2).lineTo(0, -side / 2 - 60);
      tag.centerX = 0;
      tag.bottom = -side / 2 - 60;
    });

    this.arrows = [0, 1, 2, 3].map(
      () =>
        new ArrowNode(0, 0, 10, 0, {
          fill: CalorimetryLabColors.heatArrowColorProperty,
          stroke: null,
          headWidth: 9,
          headHeight: 7,
          tailWidth: 3,
        }),
    );
    this.arrowLayer = new Node({ children: this.arrows });

    // Water level and tint.
    Multilink.multilink(
      [
        model.waterMassProperty,
        model.waterTemperatureProperty,
        model.waterInitialTemperatureProperty,
        CalorimetryLabColors.waterColorProperty,
        CalorimetryLabColors.exothermicColorProperty,
        CalorimetryLabColors.endothermicColorProperty,
      ],
      (mass, temperature, initial) => {
        this.cup.setLiquid(
          0.3 + (0.6 * (mass - WATER_MASS_RANGE.min)) / WATER_MASS_RANGE.getLength(),
          liquidTint(temperature - initial, 15),
        );
      },
    );

    model.phaseProperty.link((phase) => {
      if (phase === "ready") {
        this.dropProgress = 0;
      }
      this.layoutSample();
    });
    Multilink.multilink([model.sampleMassProperty, model.sampleProperty, model.waterMassProperty], () =>
      this.layoutSample(),
    );
    model.heatFlowProperty.link(() => this.updateArrows());

    this.children = [
      hotPlate,
      bathWater,
      bathGlass,
      bathLabel,
      this.cup,
      cupLabel,
      this.arrowLayer,
      this.sampleNode,
      thermometer,
    ];
  }

  /** Animates the drop. */
  public step(dt: number): void {
    if (this.model.phaseProperty.value === "running" && this.dropProgress < 1) {
      this.dropProgress = Math.min(1, this.dropProgress + dt / DROP_DURATION);
      this.layoutSample();
    }
  }

  private layoutSample(): void {
    const side = this.block.height;
    const bathPosition = new Vector2(BATH_LEFT + BATH_WIDTH / 2, BATH_TOP + BATH_HEIGHT - side / 2 - 14);
    const cupPosition = new Vector2(CUP_LEFT + CUP_WIDTH * 0.4, CUP_TOP + this.cup.bottomY - side / 2 - 2);
    const s = this.dropProgress;
    // Lift out of the bath, swing over and lower into the cup.
    const lift = 4 * s * (1 - s) * 90;
    this.sampleNode.translation = bathPosition.blend(cupPosition, s).minusXY(0, lift);
    this.updateArrows();
  }

  private updateArrows(): void {
    const flow = this.model.heatFlowProperty.value;
    const visible = this.model.phaseProperty.value === "running" && this.dropProgress >= 1 && flow > 0.3;
    this.arrowLayer.visible = visible;
    if (!visible) {
      return;
    }
    const center = this.sampleNode.translation;
    const half = this.block.width / 2;
    const length = Math.min(26, 6 + 4 * Math.sqrt(flow));
    const directions = [new Vector2(-1, 0), new Vector2(1, 0), new Vector2(-0.7, -0.7), new Vector2(0.7, -0.7)];
    this.arrows.forEach((arrow, i) => {
      const direction = directions[i] as Vector2;
      const tail = center.plus(direction.timesScalar(half + 4));
      const tip = tail.plus(direction.timesScalar(length));
      arrow.setTailAndTip(tail.x, tail.y, tip.x, tip.y);
    });
  }
}
