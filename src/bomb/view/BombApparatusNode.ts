/**
 * BombApparatusNode.ts
 *
 * The bomb calorimeter in cutaway: an insulating jacket around a bucket of water, the steel bomb
 * in the water with the sample pellet in its cup, ignition wires to a firing unit, a stirrer and a
 * thermometer read to 0.001 °C. Igniting flashes inside the bomb while the pellet burns away; the
 * stirrer turns while a trial runs.
 */

import { Multilink } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Circle, Node, Path, Rectangle } from "scenerystack/scenery";
import CalorimetryLabColors from "../../CalorimetryLabColors.js";
import { liquidTint } from "../../common/view/liquidTint.js";
import { ThermometerReadoutNode } from "../../common/view/ThermometerReadoutNode.js";
import type { BombCalorimeterModel } from "../model/BombCalorimeterModel.js";

const JACKET_LEFT = 40;
const JACKET_TOP = 100;
const JACKET_WIDTH = 270;
const JACKET_HEIGHT = 170;
const WALL = 14;
const WATER_TOP = JACKET_TOP + WALL + 14;
const BOMB_LEFT = 125;
const BOMB_TOP = 150;
const BOMB_WIDTH = 80;
const BOMB_HEIGHT = 100;
const PELLET_X = BOMB_LEFT + BOMB_WIDTH / 2;
const PELLET_Y = BOMB_TOP + BOMB_HEIGHT - 32;

export class BombApparatusNode extends Node {
  private readonly model: BombCalorimeterModel;
  private readonly stirrerBlade: Path;
  private stirPhase = 0;

  public constructor(model: BombCalorimeterModel) {
    super();
    this.model = model;

    const jacket = new Rectangle(JACKET_LEFT, JACKET_TOP, JACKET_WIDTH, JACKET_HEIGHT, 8, 8, {
      fill: CalorimetryLabColors.bucketColorProperty,
      stroke: CalorimetryLabColors.steelDarkColorProperty,
    });
    const lid = new Rectangle(JACKET_LEFT - 6, JACKET_TOP - 12, JACKET_WIDTH + 12, 12, 3, 3, {
      fill: CalorimetryLabColors.bucketColorProperty,
      stroke: CalorimetryLabColors.steelDarkColorProperty,
    });
    const water = new Rectangle(
      JACKET_LEFT + WALL,
      WATER_TOP,
      JACKET_WIDTH - 2 * WALL,
      JACKET_TOP + JACKET_HEIGHT - WALL - WATER_TOP,
      { fill: CalorimetryLabColors.waterColorProperty },
    );
    const bucketOutline = new Rectangle(
      JACKET_LEFT + WALL,
      JACKET_TOP + WALL,
      JACKET_WIDTH - 2 * WALL,
      JACKET_HEIGHT - 2 * WALL,
      { stroke: CalorimetryLabColors.steelColorProperty, lineWidth: 2 },
    );

    // The bomb: a thick steel cylinder with a screw cap, oxygen inside.
    const bombBody = new Rectangle(BOMB_LEFT, BOMB_TOP, BOMB_WIDTH, BOMB_HEIGHT, 10, 10, {
      fill: CalorimetryLabColors.steelColorProperty,
      stroke: CalorimetryLabColors.steelDarkColorProperty,
      lineWidth: 2,
    });
    const bombInside = new Rectangle(BOMB_LEFT + 8, BOMB_TOP + 14, BOMB_WIDTH - 16, BOMB_HEIGHT - 22, 6, 6, {
      fill: CalorimetryLabColors.chartBackgroundColorProperty,
    });
    const bombCap = new Rectangle(BOMB_LEFT - 6, BOMB_TOP - 10, BOMB_WIDTH + 12, 16, 4, 4, {
      fill: CalorimetryLabColors.steelDarkColorProperty,
    });
    const sampleCup = new Path(
      new Shape()
        .moveTo(PELLET_X - 14, PELLET_Y + 6)
        .lineTo(PELLET_X + 14, PELLET_Y + 6)
        .lineTo(PELLET_X + 10, PELLET_Y + 16)
        .lineTo(PELLET_X - 10, PELLET_Y + 16)
        .close(),
      { fill: CalorimetryLabColors.steelDarkColorProperty },
    );
    const pellet = new Rectangle(PELLET_X - 8, PELLET_Y - 4, 16, 10, 2, 2, {
      fill: CalorimetryLabColors.solidColorProperty,
      stroke: CalorimetryLabColors.solidEdgeColorProperty,
    });
    const fuseWire = new Path(
      new Shape()
        .moveTo(PELLET_X - 20, BOMB_TOP + 14)
        .lineTo(PELLET_X - 20, PELLET_Y - 8)
        .quadraticCurveTo(PELLET_X, PELLET_Y - 16, PELLET_X + 20, PELLET_Y - 8)
        .lineTo(PELLET_X + 20, BOMB_TOP + 14),
      { stroke: CalorimetryLabColors.wireColorProperty, lineWidth: 1.5 },
    );
    // A soft halo around a bright core.
    const flash = new Node({
      children: [
        new Circle(24, { fill: CalorimetryLabColors.flameColorProperty, opacity: 0.35 }),
        new Circle(12, { fill: CalorimetryLabColors.flameColorProperty }),
      ],
      x: PELLET_X,
      y: PELLET_Y,
      visible: false,
    });

    // Ignition wires up through the lid to the firing unit.
    const ignitionUnit = new Rectangle(0, 0, 44, 30, 4, 4, {
      fill: CalorimetryLabColors.hotPlateColorProperty,
      stroke: CalorimetryLabColors.steelDarkColorProperty,
    });
    const ignitionLight = new Circle(4, { fill: CalorimetryLabColors.hotPlateColorProperty, x: 22, y: 15 });
    const wires = new Path(
      new Shape()
        .moveTo(PELLET_X - 20, BOMB_TOP - 10)
        .lineTo(PELLET_X - 20, JACKET_TOP - 30)
        .lineTo(30, JACKET_TOP - 30)
        .lineTo(30, 30)
        .moveTo(PELLET_X + 20, BOMB_TOP - 10)
        .lineTo(PELLET_X + 20, JACKET_TOP - 40)
        .lineTo(14, JACKET_TOP - 40)
        .lineTo(14, 30),
      { stroke: CalorimetryLabColors.wireColorProperty, lineWidth: 2 },
    );

    // Stirrer: a shaft and a blade that flips as it turns.
    const stirrerX = JACKET_LEFT + JACKET_WIDTH - WALL - 36;
    const stirrerShaft = new Rectangle(stirrerX - 1.5, JACKET_TOP - 40, 3, JACKET_HEIGHT + 10, {
      fill: CalorimetryLabColors.steelColorProperty,
    });
    this.stirrerBlade = new Path(new Shape().ellipse(0, 0, 14, 4, 0), {
      fill: CalorimetryLabColors.steelColorProperty,
      x: stirrerX,
      y: JACKET_TOP + JACKET_HEIGHT - WALL - 18,
    });

    const thermometer = new ThermometerReadoutNode(model.waterTemperatureProperty, {
      minTemperature: 20,
      maxTemperature: 35,
      decimals: 3,
      tubeHeight: 150,
    });
    thermometer.centerX = JACKET_LEFT + WALL + 26;
    thermometer.bottom = JACKET_TOP + JACKET_HEIGHT - WALL - 10;

    Multilink.multilink([model.phaseProperty, model.burnedProperty], (phase, burned) => {
      const running = phase === "running";
      pellet.visible = !running || burned < 0.98;
      pellet.opacity = running ? 1 - burned : 1;
      flash.visible = running && burned < 0.99;
      flash.opacity = running ? Math.min(1, 3 * (1 - burned)) : 0;
      ignitionLight.fill =
        running && burned < 0.9 ? CalorimetryLabColors.flameColorProperty : CalorimetryLabColors.hotPlateColorProperty;
    });
    Multilink.multilink(
      [
        model.waterTemperatureProperty,
        CalorimetryLabColors.waterColorProperty,
        CalorimetryLabColors.exothermicColorProperty,
        CalorimetryLabColors.endothermicColorProperty,
      ],
      (temperature) => {
        water.fill = liquidTint(temperature - 25, 6);
      },
    );

    const ignition = new Node({ children: [ignitionUnit, ignitionLight] });

    this.children = [
      wires,
      jacket,
      water,
      bucketOutline,
      bombBody,
      bombInside,
      fuseWire,
      sampleCup,
      pellet,
      flash,
      bombCap,
      stirrerShaft,
      this.stirrerBlade,
      thermometer,
      lid,
      ignition,
    ];
    // The lid sits behind the shaft, thermometer and wires that pass through it.
    lid.moveToBack();
    wires.moveToBack();
  }

  /** Turns the stirrer while a trial runs. */
  public step(dt: number): void {
    if (this.model.phaseProperty.value === "running") {
      this.stirPhase += dt * 10;
      this.stirrerBlade.setScaleMagnitude(Math.max(0.1, Math.abs(Math.cos(this.stirPhase))), 1);
    }
  }
}
