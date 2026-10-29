/**
 * liquidTint.ts
 *
 * Water drawn a little warmer or cooler as its temperature moves from where it started: toward the
 * exothermic (warm) colour when it heats up, the endothermic (cool) colour when it cools.
 */

import { Color } from "scenerystack/scenery";
import CalorimetryLabColors from "../../CalorimetryLabColors.js";

/** Liquid colour for a temperature change `deltaT` (°C); `fullScale` °C gives the strongest tint. */
export function liquidTint(deltaT: number, fullScale: number): Color {
  const water = CalorimetryLabColors.waterColorProperty.value;
  const tint =
    deltaT >= 0
      ? CalorimetryLabColors.exothermicColorProperty.value
      : CalorimetryLabColors.endothermicColorProperty.value;
  const ratio = Math.min(1, Math.abs(deltaT) / fullScale) * 0.55;
  return Color.interpolateRGBA(water, tint, ratio);
}
