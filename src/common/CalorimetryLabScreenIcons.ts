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
import { CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS } from "../CalorimetryLabConstants.js";

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
    {
      fill: CalorimetryLabColors.foamColorProperty,
      stroke: CalorimetryLabColors.foamEdgeColorProperty,
      lineWidth: CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CUP_LINE_WIDTH,
    },
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
      new Rectangle(
        x - 9,
        top,
        CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.THERMOMETER_WIDTH,
        bottom - top,
        CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.THERMOMETER_CORNER_X,
        CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.THERMOMETER_CORNER_Y,
        {
          fill: CalorimetryLabColors.thermometerBackgroundColorProperty,
          stroke: CalorimetryLabColors.glassColorProperty,
          lineWidth: CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.THERMOMETER_LINE_WIDTH,
        },
      ),
      new Rectangle(
        x - 4,
        (top + bottom) / 2,
        CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.THERMOMETER_WIDTH_SEGMENT_2,
        (bottom - top) / 2,
        {
          fill: CalorimetryLabColors.thermometerFluidColorProperty,
        },
      ),
      new Path(Shape.circle(x, bottom, CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.THERMOMETER_RADIUS), {
        fill: CalorimetryLabColors.thermometerFluidColorProperty,
      }),
    ],
  });
}

function heatArrow(x1: number, y1: number, x2: number, y2: number): ArrowNode {
  return new ArrowNode(x1, y1, x2, y2, {
    fill: CalorimetryLabColors.heatArrowColorProperty,
    stroke: null,
    headWidth: CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.HEAT_ARROW_HEAD_WIDTH,
    headHeight: CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.HEAT_ARROW_HEAD_HEIGHT,
    tailWidth: CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.HEAT_ARROW_TAIL_WIDTH,
  });
}

export function createSpecificHeatIcon(): ScreenIcon {
  const block = new Rectangle(
    CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.BLOCK_X,
    CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.BLOCK_Y,
    CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.BLOCK_WIDTH,
    CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.BLOCK_HEIGHT,
    CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.BLOCK_CORNER_X,
    CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.BLOCK_CORNER_Y,
    {
      fill: CalorimetryLabColors.copperColorProperty,
      stroke: CalorimetryLabColors.steelDarkColorProperty,
      lineWidth: CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.BLOCK_LINE_WIDTH,
    },
  );
  return iconFrom(
    new Node({
      children: [
        background(),
        cup(
          110,
          80,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_SPECIFIC_HEAT_ICON_WIDTH,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_SPECIFIC_HEAT_ICON_HEIGHT,
        ),
        water(
          110,
          80,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_SPECIFIC_HEAT_ICON_WIDTH,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_SPECIFIC_HEAT_ICON_HEIGHT,
          0.7,
        ),
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
        cup(
          120,
          90,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_COFFEE_CUP_ICON_WIDTH_SEGMENT_2,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_COFFEE_CUP_ICON_HEIGHT_SEGMENT_2,
        ),
        water(
          120,
          90,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_COFFEE_CUP_ICON_WIDTH_SEGMENT_2,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_COFFEE_CUP_ICON_HEIGHT_SEGMENT_2,
          0.65,
        ),
        new Rectangle(
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_COFFEE_CUP_ICON_X,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_COFFEE_CUP_ICON_Y,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_COFFEE_CUP_ICON_WIDTH,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_COFFEE_CUP_ICON_HEIGHT,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_COFFEE_CUP_ICON_CORNER_X,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_COFFEE_CUP_ICON_CORNER_Y,
          {
            fill: CalorimetryLabColors.foamColorProperty,
            stroke: CalorimetryLabColors.foamEdgeColorProperty,
            lineWidth: CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_COFFEE_CUP_ICON_LINE_WIDTH,
          },
        ),
        new Rectangle(
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_COFFEE_CUP_ICON_X_SEGMENT_2,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_COFFEE_CUP_ICON_Y_SEGMENT_2,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_COFFEE_CUP_ICON_WIDTH_SEGMENT_3,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_COFFEE_CUP_ICON_HEIGHT_SEGMENT_3,
          { fill: CalorimetryLabColors.steelColorProperty },
        ),
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
        new Rectangle(
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_X,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_Y,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_WIDTH,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_HEIGHT,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_CORNER_X,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_CORNER_Y,
          { fill: CalorimetryLabColors.bucketColorProperty },
        ),
        new Rectangle(
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_X_SEGMENT_2,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_Y_SEGMENT_2,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_WIDTH_SEGMENT_2,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_HEIGHT_SEGMENT_2,
          { fill: CalorimetryLabColors.waterColorProperty },
        ),
        new Rectangle(
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_X_SEGMENT_3,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_Y_SEGMENT_3,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_WIDTH_SEGMENT_3,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_HEIGHT_SEGMENT_3,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_CORNER_X_SEGMENT_2,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_CORNER_Y_SEGMENT_2,
          {
            fill: CalorimetryLabColors.steelColorProperty,
            stroke: CalorimetryLabColors.steelDarkColorProperty,
            lineWidth: CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_LINE_WIDTH,
          },
        ),
        new Rectangle(
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_X_SEGMENT_4,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_Y_SEGMENT_4,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_WIDTH_SEGMENT_4,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_HEIGHT_SEGMENT_4,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_CORNER_X_SEGMENT_3,
          CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_CORNER_Y_SEGMENT_3,
          { fill: CalorimetryLabColors.steelDarkColorProperty },
        ),
        new Path(
          Shape.circle(
            CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_X_SEGMENT_5,
            CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_Y_SEGMENT_5,
            CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_RADIUS,
          ),
          { fill: CalorimetryLabColors.flameColorProperty },
        ),
        new Path(
          new Shape()
            .moveTo(
              CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_X_SEGMENT_6,
              CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_Y_SEGMENT_6,
            )
            .lineTo(
              CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_X_SEGMENT_6,
              CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_Y_SEGMENT_7,
            )
            .moveTo(
              CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_X_SEGMENT_7,
              CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_Y_SEGMENT_8,
            )
            .lineTo(
              CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_X_SEGMENT_7,
              CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_Y_SEGMENT_9,
            ),
          {
            stroke: CalorimetryLabColors.wireColorProperty,
            lineWidth: CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.CREATE_BOMB_CALORIMETER_ICON_ITEM_7_LINE_WIDTH,
          },
        ),
      ],
    }),
  );
}

export function createHessLawIcon(): ScreenIcon {
  const level = (x: number, y: number) =>
    new Rectangle(
      x - 50,
      y - 4,
      CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.LEVEL_WIDTH,
      CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.LEVEL_HEIGHT,
      { fill: CalorimetryLabColors.levelLineColorProperty },
    );
  const arrow = (x: number, y1: number, y2: number, fill: typeof CalorimetryLabColors.targetColorProperty) =>
    new ArrowNode(x, y1, x, y2, {
      fill,
      stroke: null,
      headWidth: CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.ARROW_HEAD_WIDTH,
      headHeight: CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.ARROW_HEAD_HEIGHT,
      tailWidth: CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS.ARROW_TAIL_WIDTH,
    });
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
