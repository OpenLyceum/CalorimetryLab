/**
 * Memory-leak regression suite (fleet standard).
 *
 * List every model/view object that links Properties, adds listeners, or owns child
 * nodes, with a factory that builds a fresh instance. The shared harness in
 * tests/helpers/memoryLeak.ts (template-owned) checks that each one is garbage
 * collected after dispose() and leaves no survivors across repeated cycles
 * (idempotentDispose: true also checks a second dispose()). Add sim-specific leak
 * tests below using forceGC().
 *
 * Models, screen views and their panels live for the whole sim. What is created and thrown away
 * at runtime is the Hess's-law enthalpy diagram, which rebuilds its level lines, arrows and labels
 * on every change; each links to profile colours. A TemperatureRecord owns an Emitter.
 */

import { Line, RichText } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import CalorimetryLabColors from "../src/CalorimetryLabColors.js";
import { TemperatureRecord } from "../src/common/model/TemperatureRecord.js";
import { TimeModel } from "../src/common/TimeModel.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

describeDisposalLeaks([
  { name: "TimeModel", create: () => new TimeModel(), idempotentDispose: true },
  { name: "TemperatureRecord", create: () => new TemperatureRecord(2), idempotentDispose: true },
  {
    name: "diagram arrow",
    create: () => new ArrowNode(0, 0, 0, 100, { fill: CalorimetryLabColors.exothermicColorProperty, stroke: null }),
    idempotentDispose: true,
  },
  {
    name: "diagram level",
    create: () => new Line(0, 0, 40, 0, { stroke: CalorimetryLabColors.levelLineColorProperty }),
    idempotentDispose: true,
  },
  {
    name: "diagram label",
    create: () => new RichText("Step 1: −393.5 kJ", { fill: CalorimetryLabColors.targetColorProperty }),
    idempotentDispose: true,
  },
]);
