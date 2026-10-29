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
| Coffee Cup | `src/coffee-cup/` | HCl + NaOH, five dissolving salts, Mg + HCl; limiting reactant; ΔT → q → n → ΔH (kJ/mol) against the accepted value; non-ideal cup with heat capacity and leak; drift-line extrapolation to the mixing time |
| Bomb Calorimeter | `src/bomb/` | Calibrate with benzoic acid (hidden C_cal = 10.20 kJ/°C), then Measure sucrose, glucose, naphthalene, ethanol with the student's C_cal; ΔcU per gram and per mole; ΔcH = ΔcU + Δn(gas)RT |
| Hess's Law | `src/hess-law/` | Six puzzles; reverse and scale (×½, ×1, ×2, ×3) the steps; gross sum with struck-out cancelling species, net equation, check against the target; enthalpy ladder; route through the elements with ΣνΔHf° |

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
- **Extrapolation** (`common/model/extrapolation.ts`) fits a least-squares line to the later half
  of the post-peak record once there are 30 s of drift, and evaluates it at t = 0 (mixing or
  ignition). With an ideal calorimeter the line is flat and the result equals the peak.
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
| `src/coffee-cup/model/CoffeeCupReactions.ts` | ΔH, molar masses, time constants; `reactionExtent` (limiting reactant), `solutionMass` |
| `src/bomb/model/Fuels.ts` | Benzoic acid ΔcU (certified), other ΔcH°, Δn(gas); ΔU ↔ ΔH |
| `src/hess-law/model/Species.ts` | Formulas and ΔHf° |
| `src/hess-law/model/ReactionEquation.ts` | Signed-coefficient equations: reverse, scale, add, match, format |
| `src/hess-law/model/HessPuzzles.ts` | Targets, steps and intended solutions |
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
  summary gives the reaction, temperature, ΔT and progress.
- Bomb Calorimeter: igniting, a new trial, the water settling and using a calibration are
  announced. The live summary gives the sample and the water temperature and rise.
- Hess's Law: each step's Reverse checkbox and multiplier radio group are named per step
  ("Reverse step 2", "Factor for step 2"); every change announces the step's new equation and ΔH,
  and solving announces the target's ΔH. The live summary gives the target, the net equation
  with its ΔH, and the verdict.
- The apparatus drawings are decorative; everything they show is in the summaries and readouts.

## Compliance carve-outs

None: every colour is in `CalorimetryLabColors.ts`. Liquid tints are mixed from profile colours at
runtime (`Color.interpolateRGBA` in `common/view/liquidTint.ts`), and the Hess sum's struck-out
species take the cancelled colour's CSS at render time.

### Template-owned files (drift-checked)

Infrastructure files are owned by this template and must stay byte-identical in every sim
(after substituting the sim's own name). `Baton/scripts/check-template-drift.sh <Sim>` compares a
sim against this repo using `Baton/config/template-manifest.json`, which lists the exact files,
the required `package.json` scripts, and the few keys a sim may extend (extra `biome.json`
ignores, extra tsconfig `types`, CSP/Permissions additions).

To diverge on purpose, add a bullet to the sim's own `## Compliance carve-outs` section naming
the file in backticks and the reason, e.g. ``- `tests/setup.ts`: adds a WebGPU mock``. The drift
checker treats a file named there as approved. Fix template-owned files **here first**, then
propagate — never hand-edit one in a single sim.

### `package.json` overrides

JSON cannot carry comments, so the rationale for forced transitive pins lives here. Prefer
**tilde (`~`) or exact** versions — caret (`^`) lets minors drift under what is meant to be a
hard pin. Dependabot ignores these three names (see `.github/dependabot.yml`) so it does not
open PRs that fight the overrides. Revisit when SceneryStack drops or re-pins them upstream.

| Override | Pin | Why |
|---|---|---|
| `lodash` | `~4.18.1` | SceneryStack declares `~4.17.12`. Bump clears Dependabot/npm advisories patched in 4.18.x (e.g. GHSA-r5fr-rjxr-66jc, GHSA-f23m-r3pf-42rh). |
| `three` | `~0.125.2` | SceneryStack declares `^0.104.0`. Floor is 0.125.0 for GHSA-fq6p-x6j3-cmmq (ReDoS). Staying on the 0.125 line avoids a larger API jump; **0.125.x still has open CVEs** (e.g. XSS GHSA-7vvq-7r29-5vg3, fixed only in ≥0.137.0). Remove this override if/when SceneryStack stops depending on `three` or pins a patched line itself. |
| `brace-expansion` | `~5.0.12` | Transitive via `vite-plugin-pwa` / Workbox. Clears npm audit (originally GHSA-mh99-v99m-4gvg; keep ≥5.0.9 for GHSA-rgw5-rvv9-x895; ≥5.0.12 for the CPU-DoS advisory). |

## Testing

| Path | Purpose |
|---|---|
| `tests/common/ThermalNetwork.test.ts` | Energy conservation, 50 g Cu at 100 °C into 100 g water at 20 °C → 23.52 °C, large-step stability, exact source heat, room leak |
| `tests/common/extrapolation.test.ts` | Line fit, waiting for drift, recovering the start value for warming and cooling runs |
| `tests/specific-heat/SpecificHeatModel.test.ts` | Setup tracking, closed-form equilibrium, q(sample) = −q(water) throughout, recovering the unknown's c, heat loss uninsulated, New Trial |
| `tests/coffee-cup/CoffeeCup.test.ts` | 0.050 mol in 100 g; limiting reactants; HCl + NaOH ΔT = 6.67 °C and ΔH = −55.8 kJ/mol; NH₄NO₃ cools; extrapolation within 2 % in a leaky cup |
| `tests/bomb/Bomb.test.ts` | 26.434 kJ per gram of benzoic acid; ΔU ↔ ΔH with Δn(gas); C_cal = 10.20 kJ/°C recovered; sucrose −5644 kJ/mol; extrapolation in a leaky jacket |
| `tests/hess-law/ReactionEquation.test.ts` | Reverse, scale, cancel, coefficient format; each puzzle's solution matches its target and accepted ΔH; the model solves and resets per puzzle |
| `tests/TimeModel.test.ts` | Template `TimeModel` |
| `tests/memory-leak.test.ts`, `tests/helpers/`, `tests/fuzz/` | Template-owned harness; the leak suite also covers the Hess diagram's arrows and levels |

- Unit tests live only under root `tests/`, mirroring `src/`.
- Optional: `npm run test:fuzz` / `test:fuzz:quick` / `test:fuzz:long` (not part of default CI).

## Commands

```bash
npm run lint && npm run check && npm run build && npm test
```

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run build:single` | Single-file build mode |
| `npm run check` | TypeScript (`tsc --noEmit` on app, scripts, and tests) |
| `npm run lint` / `npm run fix` | Biome check / auto-fix |
| `npm test` | Vitest unit tests |
| `npm run test:fuzz` | Playwright fuzz smoke (pointer + keyboard, `?ea`, 30s each; `npm run test:fuzz -- 90` to change) |
| `npm run test:fuzz:quick` | 10s fuzz |
| `npm run test:fuzz:long` | 300s fuzz |
| `npm run icons` | Regenerate PWA icons; seed missing screenshots, preserve existing ones |
| `npm run rename` | Sim-level fork/rename (`--id`, `--name`) |
| `npm run scaffold-screens` | Emit N screens (`--screens Intro,Lab`) |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |

`src/init.ts` reads `version` from `package.json`, so the patch bump shows up in the About dialog
without a second edit.

## PWA

After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
