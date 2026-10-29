/**
 * FoamCupNode.ts
 *
 * Two nested polystyrene cups drawn in cutaway, so the liquid inside shows, with an optional lid.
 * The origin is the top-left corner of the rim. The liquid fills the inner cup from the bottom to
 * a level given as a fraction of the inner height.
 */

import { Shape } from "scenerystack/kite";
import { Node, Path, Rectangle, type TColor } from "scenerystack/scenery";
import CalorimetryLabColors from "../../CalorimetryLabColors.js";

const WALL = 6;
const BOTTOM_RATIO = 0.72;

function trapezoid(x: number, y: number, topWidth: number, bottomWidth: number, height: number): Shape {
  const inset = (topWidth - bottomWidth) / 2;
  return new Shape()
    .moveTo(x, y)
    .lineTo(x + topWidth, y)
    .lineTo(x + topWidth - inset, y + height)
    .lineTo(x + inset, y + height)
    .close();
}

export class FoamCupNode extends Node {
  public readonly cupWidth: number;
  public readonly cupHeight: number;
  private readonly liquid: Path;
  private readonly innerTop = WALL;
  private readonly innerHeight: number;
  private readonly innerTopWidth: number;
  private readonly innerBottomWidth: number;

  public constructor(width: number, height: number, withLid: boolean) {
    super();
    this.cupWidth = width;
    this.cupHeight = height;
    this.innerHeight = height - 2 * WALL;
    this.innerTopWidth = width - 2 * WALL;
    this.innerBottomWidth = width * BOTTOM_RATIO - 2 * WALL;

    const foam = { fill: CalorimetryLabColors.foamColorProperty, stroke: CalorimetryLabColors.foamEdgeColorProperty };
    // The outer cup sits a little lower than the inner one, as nested cups do.
    const outerCup = new Path(trapezoid(-3, 10, width + 6, width * BOTTOM_RATIO + 4, height), foam);
    const innerCup = new Path(trapezoid(0, 0, width, width * BOTTOM_RATIO, height), foam);
    const cavity = new Path(
      trapezoid(WALL, this.innerTop, this.innerTopWidth, this.innerBottomWidth, this.innerHeight),
      { fill: CalorimetryLabColors.chartBackgroundColorProperty, stroke: CalorimetryLabColors.foamEdgeColorProperty },
    );
    this.liquid = new Path(null, { fill: CalorimetryLabColors.waterColorProperty });
    const children: Node[] = [outerCup, innerCup, cavity, this.liquid];
    if (withLid) {
      children.push(new Rectangle(-8, -10, width + 16, 10, 3, 3, foam));
    }
    this.children = children;
  }

  /** y of the liquid surface (local) for a fill fraction 0–1. */
  public surfaceY(fraction: number): number {
    return this.innerTop + this.innerHeight * (1 - fraction);
  }

  /** y of the inner cup's bottom (local). */
  public get bottomY(): number {
    return this.innerTop + this.innerHeight;
  }

  /** Fills the cup to `fraction` of its inner height with `fill`. */
  public setLiquid(fraction: number, fill: TColor): void {
    const level = Math.max(0, Math.min(1, fraction));
    const top = this.surfaceY(level);
    const widthAt = (y: number) =>
      this.innerBottomWidth +
      (this.innerTopWidth - this.innerBottomWidth) * (1 - (y - this.innerTop) / this.innerHeight);
    const center = this.cupWidth / 2;
    const topWidth = widthAt(top);
    const bottom = this.bottomY;
    this.liquid.shape =
      level > 0
        ? new Shape()
            .moveTo(center - topWidth / 2, top)
            .lineTo(center + topWidth / 2, top)
            .lineTo(center + this.innerBottomWidth / 2, bottom)
            .lineTo(center - this.innerBottomWidth / 2, bottom)
            .close()
        : null;
    this.liquid.fill = fill;
  }
}
