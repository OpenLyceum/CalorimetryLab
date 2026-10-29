/**
 * TemperatureChartNode.ts
 *
 * Temperature against time for a TemperatureRecord: one line per trace with a dot at its latest
 * point, a legend, and optionally the drift line extrapolated back to t = 0 (the start of the
 * reaction) with its intercept marked.
 *
 * The axes fit the content (adapted from Electrochemistry's NernstChartNode): time always spans
 * at least `minTime`, temperature at least `minSpan`, and a range is kept until the content
 * leaves it or fills less than a third of it, so the axes don't twitch while the data grows.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { ChartRectangle, ChartTransform, GridLineSet, LinePlot, TickLabelSet, TickMarkSet } from "scenerystack/bamboo";
import { Range, toFixed, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Orientation, optionize } from "scenerystack/phet-core";
import { Circle, HBox, Line, Node, type NodeOptions, RichText, type TColor, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import CalorimetryLabColors from "../../CalorimetryLabColors.js";
import { FONT_SIZE } from "../../CalorimetryLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { type DriftLine, temperatureOnLine } from "../model/extrapolation.js";
import type { TemperatureRecord } from "../model/TemperatureRecord.js";
import { fixed } from "./formatValues.js";

/** A "nice" tick spacing (1, 2, 2.5 or 5 × 10ⁿ) giving about `count` intervals over `span`. */
export function niceStep(span: number, count: number): number {
  const raw = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const nice = [1, 2, 2.5, 5, 10].find((m) => m * magnitude >= raw) ?? 10;
  return nice * magnitude;
}

/** Smallest range of multiples of a nice step that covers [min, max]. */
function niceRange(min: number, max: number, count: number): { range: Range; step: number } {
  const step = niceStep(Math.max(max - min, 1e-6), count);
  return { range: new Range(Math.floor(min / step) * step, Math.ceil(max / step) * step), step };
}

/** Tick label with just enough decimals for the tick spacing. */
function tickLabel(value: number, step: number): Text {
  const decimals = [0, 1, 2, 3].find((d) => Math.abs(Number(toFixed(step, d)) - step) < 1e-9) ?? 3;
  return new Text(fixed(value, decimals), {
    font: new PhetFont(FONT_SIZE.tiny),
    fill: CalorimetryLabColors.textColorProperty,
  });
}

export type ChartTrace = {
  readonly color: TColor;
  readonly label: TReadOnlyProperty<string>;
};

type SelfOptions = {
  /** Smallest temperature span shown (°C). */
  minSpan?: number;
  /** Smallest time span shown (s). */
  minTime?: number;
  /** Temperatures always inside the axes, e.g. the starting temperatures before a run. */
  referenceTemperatureProperties?: readonly TReadOnlyProperty<number>[];
  /** Drift line to extrapolate, and whether to draw it. */
  driftLineProperty?: TReadOnlyProperty<DriftLine | null> | null;
  showExtrapolationProperty?: TReadOnlyProperty<boolean> | null;
};

export type TemperatureChartNodeOptions = SelfOptions & NodeOptions;

export class TemperatureChartNode extends Node {
  private readonly chartTransform: ChartTransform;
  private readonly gridX: GridLineSet;
  private readonly gridY: GridLineSet;
  private readonly ticksX: TickMarkSet;
  private readonly ticksY: TickMarkSet;
  private readonly labelsX: TickLabelSet;
  private readonly labelsY: TickLabelSet;
  private xStep = 10;
  private yStep = 1;

  public constructor(
    record: TemperatureRecord,
    traces: readonly ChartTrace[],
    width: number,
    height: number,
    providedOptions?: TemperatureChartNodeOptions,
  ) {
    const options = optionize<TemperatureChartNodeOptions, SelfOptions, NodeOptions>()(
      {
        minSpan: 2,
        minTime: 60,
        referenceTemperatureProperties: [],
        driftLineProperty: null,
        showExtrapolationProperty: null,
      },
      providedOptions,
    );
    super();
    const common = StringManager.getInstance().getCommonStrings();
    const labelFont = new PhetFont(FONT_SIZE.tiny);

    this.chartTransform = new ChartTransform({
      viewWidth: width,
      viewHeight: height,
      modelXRange: new Range(0, options.minTime),
      modelYRange: new Range(0, 100),
    });
    const transform = this.chartTransform;
    const grid = { stroke: CalorimetryLabColors.chartGridColorProperty };
    const ticks = { edge: "min" as const, stroke: CalorimetryLabColors.chartAxisColorProperty };
    this.gridX = new GridLineSet(transform, Orientation.HORIZONTAL, this.xStep, grid);
    this.gridY = new GridLineSet(transform, Orientation.VERTICAL, this.yStep, grid);
    this.ticksX = new TickMarkSet(transform, Orientation.HORIZONTAL, this.xStep, ticks);
    this.ticksY = new TickMarkSet(transform, Orientation.VERTICAL, this.yStep, ticks);
    this.labelsX = new TickLabelSet(transform, Orientation.HORIZONTAL, this.xStep, {
      edge: "min",
      createLabel: (value) => tickLabel(value, this.xStep),
    });
    this.labelsY = new TickLabelSet(transform, Orientation.VERTICAL, this.yStep, {
      edge: "min",
      createLabel: (value) => tickLabel(value, this.yStep),
    });

    const plots = traces.map((trace) => new LinePlot(transform, [], { stroke: trace.color, lineWidth: 2 }));
    const dots = traces.map((trace) => new Circle(4, { fill: trace.color, visible: false }));
    const extrapolationLine = new LinePlot(transform, [], {
      stroke: CalorimetryLabColors.extrapolationColorProperty,
      lineDash: [5, 4],
      lineWidth: 1.5,
    });
    const extrapolationPoint = new Circle(4.5, {
      stroke: CalorimetryLabColors.extrapolationColorProperty,
      lineWidth: 2,
      visible: false,
    });
    const plot = new Node({
      children: [extrapolationLine, ...plots, extrapolationPoint, ...dots],
      clipArea: Shape.rect(-6, -6, width + 12, height + 12),
    });

    const titleFont = new PhetFont(FONT_SIZE.small);
    const xTitle = new RichText(common.xAxisStringProperty, {
      font: titleFont,
      fill: CalorimetryLabColors.mutedTextColorProperty,
      maxWidth: width,
    });
    xTitle.boundsProperty.link(() => {
      xTitle.centerX = width / 2;
      xTitle.top = height + 18;
    });
    const yTitle = new RichText(common.yAxisStringProperty, {
      font: titleFont,
      fill: CalorimetryLabColors.mutedTextColorProperty,
      rotation: -Math.PI / 2,
      maxWidth: height,
    });
    yTitle.boundsProperty.link(() => {
      yTitle.right = -36;
      yTitle.centerY = height / 2;
    });
    const title = new RichText(common.chartTitleStringProperty, {
      font: new PhetFont({ size: FONT_SIZE.label, weight: "bold" }),
      fill: CalorimetryLabColors.textColorProperty,
      maxWidth: width * 0.5,
    });
    title.boundsProperty.link(() => {
      title.left = 0;
      title.bottom = -8;
    });

    const legendEntry = (color: TColor, text: TReadOnlyProperty<string>, dashed: boolean) =>
      new HBox({
        spacing: 4,
        children: [
          new Line(0, 0, 16, 0, { stroke: color, lineWidth: 2, lineDash: dashed ? [4, 3] : [] }),
          new Text(text, { font: labelFont, fill: CalorimetryLabColors.textColorProperty, maxWidth: 80 }),
        ],
      });
    const legend = new HBox({
      spacing: 10,
      children: [
        ...traces.map((trace) => legendEntry(trace.color, trace.label, false)),
        ...(options.driftLineProperty
          ? [legendEntry(CalorimetryLabColors.extrapolationColorProperty, common.extrapolatedStringProperty, true)]
          : []),
      ],
      maxWidth: width * 0.5,
    });
    legend.boundsProperty.link(() => {
      legend.right = width;
      legend.bottom = -10;
    });

    this.children = [
      new ChartRectangle(transform, {
        fill: CalorimetryLabColors.chartBackgroundColorProperty,
        stroke: CalorimetryLabColors.chartAxisColorProperty,
      }),
      this.gridX,
      this.gridY,
      plot,
      this.ticksX,
      this.ticksY,
      this.labelsX,
      this.labelsY,
      xTitle,
      yTitle,
      title,
      legend,
    ];

    const update = () => {
      const drift = options.driftLineProperty?.value ?? null;
      const showDrift = !!drift && (options.showExtrapolationProperty?.value ?? true);
      const temperatures = options.referenceTemperatureProperties.map((p) => p.value);
      let lastTime = 0;
      for (const trace of record.traces) {
        for (const point of trace) {
          temperatures.push(point.y);
        }
        lastTime = Math.max(lastTime, trace[trace.length - 1]?.x ?? 0);
      }
      if (showDrift && drift) {
        temperatures.push(temperatureOnLine(drift, 0));
      }
      this.fitRanges(lastTime, temperatures, options.minTime, options.minSpan);

      record.traces.forEach((trace, i) => {
        plots[i]?.setDataSet(trace);
        const dot = dots[i];
        const last = trace[trace.length - 1];
        if (dot) {
          dot.visible = !!last;
          if (last) {
            dot.translation = transform.modelToViewPosition(last);
          }
        }
      });
      extrapolationLine.visible = showDrift;
      extrapolationPoint.visible = showDrift;
      if (showDrift && drift) {
        extrapolationLine.setDataSet([
          new Vector2(0, temperatureOnLine(drift, 0)),
          new Vector2(drift.toTime, temperatureOnLine(drift, drift.toTime)),
        ]);
        extrapolationPoint.translation = transform.modelToViewXY(0, temperatureOnLine(drift, 0));
      }
    };
    record.changedEmitter.addListener(update);
    const dependencies = [
      ...options.referenceTemperatureProperties,
      ...(options.driftLineProperty ? [options.driftLineProperty] : []),
      ...(options.showExtrapolationProperty ? [options.showExtrapolationProperty] : []),
    ];
    if (dependencies.length > 0) {
      Multilink.multilinkAny(dependencies, update);
    } else {
      update();
    }
  }

  /** Widens or narrows the axes to fit the run so far. */
  private fitRanges(lastTime: number, temperatures: readonly number[], minTime: number, minSpan: number): void {
    const xMax = Math.max(minTime, lastTime * 1.05);
    const x = this.chartTransform.modelXRange;
    if (!(x.max >= xMax && x.max <= 3 * xMax)) {
      const fit = niceRange(0, xMax, 6);
      this.xStep = fit.step;
      this.chartTransform.setModelXRange(fit.range);
    }

    const low = temperatures.length > 0 ? Math.min(...temperatures) : 20;
    const high = temperatures.length > 0 ? Math.max(...temperatures) : 20;
    const middle = (low + high) / 2;
    const half = Math.max(minSpan, (high - low) * 1.15) / 2;
    const yMin = middle - half;
    const yMax = middle + half;
    const y = this.chartTransform.modelYRange;
    if (!(y.min <= yMin && y.max >= yMax && y.getLength() <= 3 * (yMax - yMin))) {
      const fit = niceRange(yMin, yMax, 5);
      this.yStep = fit.step;
      this.chartTransform.setModelYRange(fit.range);
    }
    for (const set of [this.gridX, this.ticksX, this.labelsX]) {
      set.setSpacing(this.xStep);
    }
    for (const set of [this.gridY, this.ticksY, this.labelsY]) {
      set.setSpacing(this.yStep);
    }
    // Labels depend on the step's decimals; a new createLabel also clears the label cache.
    const xStep = this.xStep;
    const yStep = this.yStep;
    this.labelsX.setCreateLabel((value) => tickLabel(value, xStep));
    this.labelsY.setCreateLabel((value) => tickLabel(value, yStep));
  }
}
