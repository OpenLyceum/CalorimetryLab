/**
 * CalorimetryLabScreenIcons.ts
 *
 * Programmatic home-screen / navigation-bar icons for each screen.
 * Drawn on the standard PhET 548 × 373 canvas using CalorimetryLabColors.
 * Each icon is a simplified drawing of its screen: a hot block in a cup, a coffee-cup
 * calorimeter, a bomb in its bucket, and an enthalpy ladder.
 */
import { Shape } from "scenerystack/kite";
import { Node, Path, Rectangle } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { ScreenIcon } from "scenerystack/sim";
import CalorimetryLabColors from "../CalorimetryLabColors.js";

const W = 548;
const H = 373;

function background(): Rectangle {
  return new Rectangle(0, 0, W, H, { fill: CalorimetryLabColors.backgroundColorProperty });
}

function iconFrom(content: Node): ScreenIcon {
  return new ScreenIcon(content, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: CalorimetryLabColors.backgroundColorProperty,
  });
}

/** A tapered foam cup, top-left at (x, y). */
function cup(x: number, y: number, width: number, height: number): Path {
  const inset = width * 0.14;
  return new Path(
    new Shape()
      .moveTo(x, y)
      .lineTo(x + width, y)
      .lineTo(x + width - inset, y + height)
      .lineTo(x + inset, y + height)
      .close(),
    { fill: CalorimetryLabColors.foamColorProperty, stroke: CalorimetryLabColors.foamEdgeColorProperty, lineWidth: 6 },
  );
}

/** Water filling the lower part of a cup drawn by cup(). */
function water(x: number, y: number, width: number, height: number, level: number): Path {
  const inset = width * 0.14;
  const top = y + height * (1 - level);
  const topInset = inset * (1 - level) + 14;
  return new Path(
    new Shape()
      .moveTo(x + topInset, top)
      .lineTo(x + width - topInset, top)
      .lineTo(x + width - inset - 10, y + height - 10)
      .lineTo(x + inset + 10, y + height - 10)
      .close(),
    { fill: CalorimetryLabColors.waterColorProperty },
  );
}

function thermometer(x: number, top: number, bottom: number): Node {
  return new Node({
    children: [
      new Rectangle(x - 9, top, 18, bottom - top, 9, 9, {
        fill: CalorimetryLabColors.thermometerBackgroundColorProperty,
        stroke: CalorimetryLabColors.glassColorProperty,
        lineWidth: 3,
      }),
      new Rectangle(x - 4, (top + bottom) / 2, 8, (bottom - top) / 2, {
        fill: CalorimetryLabColors.thermometerFluidColorProperty,
      }),
      new Path(Shape.circle(x, bottom, 16), { fill: CalorimetryLabColors.thermometerFluidColorProperty }),
    ],
  });
}

function heatArrow(x1: number, y1: number, x2: number, y2: number): ArrowNode {
  return new ArrowNode(x1, y1, x2, y2, {
    fill: CalorimetryLabColors.heatArrowColorProperty,
    stroke: null,
    headWidth: 34,
    headHeight: 26,
    tailWidth: 12,
  });
}

export function createSpecificHeatIcon(): ScreenIcon {
  const block = new Rectangle(210, 190, 90, 90, 6, 6, {
    fill: CalorimetryLabColors.copperColorProperty,
    stroke: CalorimetryLabColors.steelDarkColorProperty,
    lineWidth: 3,
  });
  return iconFrom(
    new Node({
      children: [
        background(),
        cup(110, 80, 330, 250),
        water(110, 80, 330, 250, 0.7),
        block,
        heatArrow(200, 235, 140, 235),
        heatArrow(310, 235, 370, 235),
        heatArrow(255, 180, 255, 125),
        thermometer(400, 30, 270),
      ],
    }),
  );
}

export function createCoffeeCupIcon(): ScreenIcon {
  return iconFrom(
    new Node({
      children: [
        background(),
        cup(120, 90, 300, 250),
        water(120, 90, 300, 250, 0.65),
        new Rectangle(100, 70, 340, 26, 8, 8, {
          fill: CalorimetryLabColors.foamColorProperty,
          stroke: CalorimetryLabColors.foamEdgeColorProperty,
          lineWidth: 6,
        }),
        new Rectangle(220, 20, 8, 290, { fill: CalorimetryLabColors.steelColorProperty }),
        thermometer(330, 20, 290),
      ],
    }),
  );
}

export function createBombCalorimeterIcon(): ScreenIcon {
  return iconFrom(
    new Node({
      children: [
        background(),
        new Rectangle(70, 70, 410, 280, 16, 16, { fill: CalorimetryLabColors.bucketColorProperty }),
        new Rectangle(95, 110, 360, 215, { fill: CalorimetryLabColors.waterColorProperty }),
        new Rectangle(205, 140, 140, 160, 18, 18, {
          fill: CalorimetryLabColors.steelColorProperty,
          stroke: CalorimetryLabColors.steelDarkColorProperty,
          lineWidth: 5,
        }),
        new Rectangle(195, 122, 160, 30, 6, 6, { fill: CalorimetryLabColors.steelDarkColorProperty }),
        new Path(Shape.circle(275, 240, 34), { fill: CalorimetryLabColors.flameColorProperty }),
        new Path(new Shape().moveTo(240, 122).lineTo(240, 30).moveTo(310, 122).lineTo(310, 30), {
          stroke: CalorimetryLabColors.wireColorProperty,
          lineWidth: 7,
        }),
      ],
    }),
  );
}

export function createHessLawIcon(): ScreenIcon {
  const level = (x: number, y: number) =>
    new Rectangle(x - 50, y - 4, 100, 8, { fill: CalorimetryLabColors.levelLineColorProperty });
  const arrow = (x: number, y1: number, y2: number, fill: typeof CalorimetryLabColors.targetColorProperty) =>
    new ArrowNode(x, y1, x, y2, { fill, stroke: null, headWidth: 40, headHeight: 34, tailWidth: 14 });
  return iconFrom(
    new Node({
      children: [
        background(),
        level(110, 80),
        level(250, 300),
        level(390, 170),
        arrow(110, 84, 296, CalorimetryLabColors.exothermicColorProperty),
        arrow(250, 296, 174, CalorimetryLabColors.endothermicColorProperty),
        arrow(470, 84, 166, CalorimetryLabColors.targetColorProperty),
      ],
    }),
  );
}
