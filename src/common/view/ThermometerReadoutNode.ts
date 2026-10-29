/**
 * ThermometerReadoutNode.ts
 *
 * A liquid thermometer (scenery-phet ThermometerNode) with a digital readout under it, read to
 * the precision of the experiment: 0.01 °C for a coffee cup, 0.001 °C for a bomb calorimeter.
 * The readout sits above the tube, with an optional label above it, so the thermometer can be
 * dipped into a liquid from above.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { Node, type NodeOptions, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont, ThermometerNode } from "scenerystack/scenery-phet";
import CalorimetryLabColors from "../../CalorimetryLabColors.js";
import { FONT_SIZE } from "../../CalorimetryLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { fixed } from "./formatValues.js";

type SelfOptions = {
  minTemperature?: number;
  maxTemperature?: number;
  decimals?: number;
  tubeHeight?: number;
  /** Text above the readout naming what the thermometer measures. */
  label?: TReadOnlyProperty<string> | null;
};

export type ThermometerReadoutNodeOptions = SelfOptions & NodeOptions;

export class ThermometerReadoutNode extends Node {
  /** The thermometer alone, for positioning its bulb in a liquid. */
  public readonly thermometer: ThermometerNode;

  /** The digital readout box. */
  public readonly readout: Node;

  public constructor(temperatureProperty: TReadOnlyProperty<number>, providedOptions?: ThermometerReadoutNodeOptions) {
    const options = optionize<ThermometerReadoutNodeOptions, SelfOptions, NodeOptions>()(
      { minTemperature: 0, maxTemperature: 100, decimals: 2, tubeHeight: 150, label: null },
      providedOptions,
    );
    super();
    const common = StringManager.getInstance().getCommonStrings();

    this.thermometer = new ThermometerNode(temperatureProperty, options.minTemperature, options.maxTemperature, {
      bulbDiameter: 18,
      tubeWidth: 9,
      tubeHeight: options.tubeHeight,
      lineWidth: 1.5,
      tickSpacing: options.tubeHeight / 10,
      majorTickLength: 6,
      minorTickLength: 3,
      glassThickness: 2,
      outlineStroke: CalorimetryLabColors.glassColorProperty,
      backgroundFill: CalorimetryLabColors.thermometerBackgroundColorProperty,
      fluidMainColor: CalorimetryLabColors.thermometerFluidColorProperty,
      fluidHighlightColor: CalorimetryLabColors.thermometerHighlightColorProperty,
      fluidRightSideColor: CalorimetryLabColors.thermometerFluidColorProperty,
    });

    const textProperty = new DerivedProperty(
      [temperatureProperty, common.celsiusPatternStringProperty],
      (temperature, pattern) => StringUtils.fillIn(pattern, { value: fixed(temperature, options.decimals) }),
    );
    const text = new Text(textProperty, {
      font: new PhetFont({ size: FONT_SIZE.small, family: "monospace" }),
      fill: CalorimetryLabColors.textColorProperty,
      maxWidth: 90,
    });
    const background = new Rectangle(0, 0, 80, 20, 4, 4, {
      fill: CalorimetryLabColors.readoutBackgroundColorProperty,
      stroke: CalorimetryLabColors.panelBorderColorProperty,
    });
    text.boundsProperty.link(() => {
      text.center = background.center;
    });
    this.readout = new Node({ children: [background, text] });
    this.readout.centerX = this.thermometer.centerX;
    this.readout.bottom = this.thermometer.top - 4;

    const children: Node[] = [this.thermometer, this.readout];
    if (options.label) {
      const label = new Text(options.label, {
        font: new PhetFont(FONT_SIZE.tiny),
        fill: CalorimetryLabColors.mutedTextColorProperty,
        maxWidth: 90,
      });
      label.boundsProperty.link(() => {
        label.centerX = this.readout.centerX;
        label.bottom = this.readout.top - 2;
      });
      children.push(label);
    }
    this.children = children;
    this.mutate(options);
  }
}
