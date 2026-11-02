# AGENTS.md — CalorimetryLab

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Calorimetry and Hess's law for **introductory (General) chemistry**, the thermochemistry chapter
of Gen Chem 1 (OpenStax *Chemistry 2e*, chapter 5). It sits with LightAndAtoms, PeriodicTrends,
TitrationLab and Electrochemistry in the Gen Chem set and fills a gap: PhET has no
thermochemistry simulation. Four screens:

| Screen | Folder | Content |
|---|---|---|
| Specific Heat | `src/specific-heat/` | Hot sample (five metals, two unknowns) dropped into water; both temperatures on a chart; q = mcΔT for each and q(sample) = −q(water); solve for an unknown's c; uninsulated cup leaks to the room |
| Coffee Cup | `src/coffee-cup/` | HCl + NaOH, five dissolving salts, Mg + HCl; limiting reactant; ΔT → q → n → ΔH (kJ/mol) against the accepted value; non-ideal cup with heat capacity and leak; drift-line extrapolation to the mixing time; setups that would pass 60 °C or oversaturate KNO₃ are refused |
| Bomb Calorimeter | `src/bomb/` | Calibrate with benzoic acid (hidden C_cal = 10.20 kJ/°C), then Measure sucrose, glucose, naphthalene, ethanol with the student's C_cal; ΔcU per gram and per mole; ΔcH = ΔcU + Δn(gas)RT |
| Hess's Law | `src/hess-law/` | Six puzzles; reverse and scale (×½, ×1, ×2, ×3) the steps; gross sum with the cancelling amount of each species struck out (the remainder left unstruck), net equation, check against the target; enthalpy ladder; route through the elements with ΣνΔHf° |

Chemistry, data sources and assumptions: [`doc/model.md`](doc/model.md). Architecture and design
decisions: [`doc/implementation-notes.md`](doc/implementation-notes.md).

### Things to know first

- **One heat engine for three screens.** `common/model/ThermalNetwork.ts` integrates lumped
  bodies (C in J/°C) joined by conductances (W/°C), with optional room links and source powers,
  using RK4 in substeps of at most a tenth of the fastest time constant. Insulated, Σ C·T is
  conserved to round-off, which the tests rely on (q(sample) = −q(water) at every instant).
- **Reactions release heat exactly.** Coffee-cup reactions and bomb burns run first-order,
  ξ(t) = ξ_max(1 − e^(−t/τ)); each step adds −ΔH × Δξ as a constant power over the step, so the
  total heat is exact whatever the frame rate.
- **Trials are frozen at start.** Every screen has a `phaseProperty` ("ready" / "running"). Setup
  controls are disabled while a trial runs; `trialProperty` (Coffee Cup, Bomb) holds the setup
  the analysis uses. New Trial (or changing reaction / mode) returns to "ready".
- **Calculations are pure functions** (`coffee-cup/model/coffeeCupAnalysis.ts`,
  `bomb/model/bombAnalysis.ts`) of the trial, the peak temperature and the drift line, so the
  view, the screen summary and the tests agree.
- **Extrapolation** (`common/model/extrapolation.ts`) fits a least-squares line to a fixed 30 s
  window of the drift and evaluates it at t = 0 (mixing or ignition). The window opens
  `DRIFT_START_TIME_CONSTANTS` (9) reaction time constants after mixing (`driftStartTime`) or
  `BOMB_DRIFT_START_TIME` (400 s) after ignition. Each model keeps the line once it is fitted,
  so later drift and record thinning never move it. Don't go back to a window that grows with
  the run: the drift is exponential and the result creeps. With an ideal calorimeter the line is
  flat and the result equals the plateau.
- **Coffee-cup setups are bounded.** `setupProblem` (`CoffeeCupReactions.ts`) refuses a setup
  whose start, ideal-cup final temperature or room temperature falls outside
  `SOLUTION_TEMPERATURE_RANGE` (0–60 °C; no evaporation or latent heat in the model), or that
  needs more KNO₃ than dissolves at the coldest of them (the solubility table on the reaction).
  `mix()` does nothing then. The view disables Mix and explains why.
- **Calibration waits for a valid result.** `calibrationResult` (`bombAnalysis.ts`) is null until
  400 s after ignition (and until the drift line exists, if extrapolating) or when the value is
  outside the C_cal range. "Use This C_cal" is enabled by it and saves exactly that value.
  `useCalibration` refuses, never clamps.
- **Coarse frames still record the bomb's drift.** `BombCalorimeterModel.run` integrates and
  records in intervals no longer than `RECORD_INTERVAL` (0.5 simulated seconds). Keep this sampling
  inside long calls: one sample per Fast-mode frame can miss the fixed window permanently.
- **Coffee-cup peaks follow the reaction direction.** Keep the minimum for an endothermic trial
  and maximum for an exothermic one, so later opposite room drift cannot reverse the measured ΔH.
- **The bomb's C_cal is hidden.** `TRUE_CALORIMETER_CONSTANT` = 2000 g × 4.184 + 1832 J/°C =
  10.20 kJ/°C. The Measure mode uses the student's `calorimeterConstantProperty` (default
  10.00 kJ/°C, so an uncalibrated result is visibly 2 % off).
- **Hess data are one table.** Every step and target ΔH in `HessPuzzles.ts` comes from the ΔHf°
  values in `Species.ts` through `ReactionEquation.fromFormation`, so the Hess route and the
  formation route always agree (CH₄ combustion comes out −890.5 kJ/mol, not the −890.4 quoted
  from more precise data). Changing a value means changing a test.
- **The `calculations` preference** (query parameter `calculations`, default true) hides every
  worked calculation and the per-screen "Show calculation" checkbox; on Hess's Law it hides the
  formation-route arithmetic.

## Key files

| File | Purpose |
|---|---|
| `src/CalorimetryLabConstants.ts` | Ranges, defaults, heat capacities, conductances, time scales, record sizes, layout |
| `src/CalorimetryLabColors.ts` | All `ProfileColorProperty` instances: chrome, chart, apparatus, metals, exo/endothermic |
| `src/common/model/ThermalNetwork.ts` | Lumped-capacitance heat exchange (RK4) |
| `src/common/model/TemperatureRecord.ts` | Sampled (t, T) traces; thins itself when full |
| `src/common/model/extrapolation.ts` | Least-squares drift line and its value at t = 0 |
| `src/specific-heat/model/Samples.ts` | Specific heats and densities; unknowns are Ti and Mg |
| `src/coffee-cup/model/CoffeeCupReactions.ts` | ΔH, molar masses, time constants, KNO₃ solubility; `reactionExtent` (limiting reactant), `solutionMass`, `driftStartTime`, `finalTemperature`, `setupProblem` |
| `src/coffee-cup/view/describeSetupProblem.ts` | Visible and screen-reader text for a refused setup |
| `src/bomb/model/Fuels.ts` | Benzoic acid ΔcU (certified), other ΔcH°, Δn(gas); ΔU ↔ ΔH |
| `src/hess-law/model/Species.ts` | Formulas and ΔHf° |
| `src/hess-law/model/ReactionEquation.ts` | Signed-coefficient equations: reverse, scale, add, match, format |
| `src/hess-law/model/HessPuzzles.ts` | Targets, steps and intended solutions |
| `src/hess-law/model/grossSum.ts` | Gross sum bookkeeping: cancelled min(left, right) and remaining amounts; formatting with a `strike` callback |
| `src/common/view/TemperatureChartNode.ts` | Self-fitting T-against-t chart with legend and extrapolation |
| `src/common/view/ThermometerReadoutNode.ts` | `ThermometerNode` with a digital readout above it |
| `src/common/view/FoamCupNode.ts` | Nested foam cups in cutaway with a liquid level |
| `src/common/view/ControlFactory.ts` | Themed control builders (copied from Electrochemistry, plus `note`) |
| `src/hess-law/view/EnthalpyDiagramNode.ts` | Enthalpy ladder for the Hess and formation routes |
| `src/hess-law/view/StepCardNode.ts` | One step: equation, ΔH, Reverse, multiplier |

## Accessibility

- Specific Heat: dropping the sample, a new trial and reaching thermal equilibrium are
  announced. The live summary gives the setup before the drop, then both temperatures and the
  water's heat gain.
- Coffee Cup: mixing, a new trial and the reaction finishing (with ΔT) are announced. The live
  summary gives the reaction, temperature, ΔT and progress. When a setup is refused, Mix is
  disabled, and its help text and the summary's ready paragraph say why, in plain words.
- Bomb Calorimeter: igniting, a new trial, the water settling (400 s after ignition, in either
  jacket) and using a calibration are announced. "Use This C_cal" stays disabled until the
  calibration is valid. The live summary gives the sample and the water temperature and rise.
- Hess's Law: each step's Reverse checkbox and multiplier radio group are named per step
  ("Reverse step 2", "Factor for step 2"); every change announces the step's new equation and ΔH,
  and solving announces the target's ΔH. The live summary gives the target, the net equation
  with its ΔH, and the verdict.
- The apparatus drawings are decorative; everything they show is in the summaries and readouts.

## Compliance carve-outs

None: every colour is in `CalorimetryLabColors.ts`. Liquid tints are mixed from profile colours at
runtime (`Color.interpolateRGBA` in `common/view/liquidTint.ts`), and the Hess sum's struck-out
species take the cancelled colour's CSS at render time.

## Testing

| Path | Purpose |
|---|---|
| `tests/common/ThermalNetwork.test.ts` | Energy conservation, 50 g Cu at 100 °C into 100 g water at 20 °C → 23.52 °C, large-step stability, exact source heat, room leak |
| `tests/common/extrapolation.test.ts` | Line fit, waiting for the window, recovering the start value for warming and cooling runs, no creep along an exponential drift |
| `tests/specific-heat/SpecificHeatModel.test.ts` | Setup tracking, closed-form equilibrium, q(sample) = −q(water) throughout, recovering the unknown's c, heat loss uninsulated, New Trial |
| `tests/coffee-cup/CoffeeCup.test.ts` | 0.050 mol in 100 g; limiting reactants; HCl + NaOH ΔT = 6.67 °C and ΔH = −55.8 kJ/mol; NH₄NO₃ cools; extrapolation within 2 % in a leaky cup and unchanged from 300 s to 3000 s (through record thinning), for warming and cooling, ideal and leaky; refusing Mg + HCl at 130 °C and 10 g of KNO₃ in 50 mL at 15 °C; the KNO₃ saturation boundary; every allowed range-end setup stays within 0–60 °C and dissolved |
| `tests/bomb/Bomb.test.ts` | 26.434 kJ per gram of benzoic acid; ΔU ↔ ΔH with Δn(gas); C_cal = 10.20 kJ/°C recovered; sucrose −5644 kJ/mol; extrapolation in a leaky jacket; no calibration at 7 s or 60 s, a valid one after the water settles (and after the drift line, if extrapolating), stable to 3000 s; `useCalibration` refuses instead of clamping |
| `tests/hess-law/ReactionEquation.test.ts` | Reverse, scale, cancel, coefficient format; each puzzle's solution matches its target and accepted ΔH; the model solves and resets per puzzle |
| `tests/hess-law/grossSum.test.ts` | Only min(left, right) is struck (carbon monoxide at ×1 and reversed ×½); whole terms when they cancel completely; for every puzzle and every reversal and factor, the unstruck terms are the net equation |
| `tests/TimeModel.test.ts` | Template `TimeModel` |
| `tests/memory-leak.test.ts`, `tests/helpers/`, `tests/fuzz/` | Template-owned harness; the leak suite also covers the Hess diagram's arrows and levels |

## PWA

After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
