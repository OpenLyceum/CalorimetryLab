# Calorimetry Lab functional review

Reviewed 2026-10-30 at commit `ee5ffad0b02759a7e48ab70ceca6638edd9d691e`.
Repository: `/home/veillette/OpenLyceum/CalorimetryLab`.
Environment: Ubuntu 26.04.1 LTS (Windows distribution name `Ubuntu-24.04`), Node v26.13.0.

## Scope and outcome

Reviewed Specific Heat, Coffee Cup, Bomb Calorimeter, and Hess's Law. Traced the thermal solver, reaction heat accounting, trial state, temperature recording, peak selection, drift fitting, calibration/measurement calculations, Hess arithmetic, and time-control callbacks. Ran the existing checks and deterministic browser probes, and inspected desktop screenshots of all four screens.

The initial review found two reproducible P2 issues, recorded below. Both are now addressed by the follow-up changes in the Resolution section. The initial review itself made no application-source changes and created no commits, pushes, or GitHub issues.

## Findings

### P2: Room drift can replace the reaction peak and reverse the calculated enthalpy sign

Location: `src/coffee-cup/model/CoffeeCupModel.ts:252`; the peak is consumed by `coffee-cup/model/coffeeCupAnalysis.ts` and the Coffee Cup calculation view.

The model updates its peak whenever the absolute difference from the starting temperature increases, regardless of the reaction's direction. In a non-ideal cup, the room can eventually drive the solution farther in the opposite direction than the reaction did. That later drift overwrites the reaction's temperature extremum. With Extrapolate ΔT off, the calculation then treats environmental heat as reaction heat and can reverse the sign of ΔH. The same problem affects the peak fallback while an extrapolation is requested but unavailable.

Reproduction: choose dissolving ammonium nitrate, 1 g solid, 100 mL water, and a 15 °C start; uncheck Ideal calorimeter and Extrapolate ΔT, then Mix and continue the run. This setup is accepted by `setupProblem`. Deterministic 1-second simulated steps gave:

- At 120 s, the stored minimum was 14.50049 °C, giving ΔT = −0.49951 °C and apparent ΔH = +17.6954 kJ/mol.
- At 3000 s, room warming had overwritten that minimum with 21.48624 °C. The display used ΔT = +6.48624 °C and ΔH = −229.7801 kJ/mol, alongside the accepted +25.69 kJ/mol value and the endothermic explanation.

The expected non-ideal error without extrapolation does not justify replacing the reaction minimum with a subsequent warming maximum. The browser screenshot confirms the contradictory sign is shown in the worked calculation.

Suggested correction: retain the minimum temperature for endothermic trials and the maximum for exothermic trials, or explicitly delimit reaction-peak acquisition. Cover both reaction directions, starts above and below room temperature, and long runs after the temperature crosses its initial value. Preserve the separately fitted extrapolation result.

### P2: Sparse frames can permanently prevent bomb calibration with extrapolation

Locations: `src/common/model/TemperatureRecord.ts:29`, `src/common/model/extrapolation.ts:58`, and `src/bomb/model/BombCalorimeterModel.ts` (step/run/update). The calibration gate is in `src/bomb/model/bombAnalysis.ts`.

TemperatureRecord stores at most one point per model step. The bomb's fixed 400–430 s drift window requires at least three recorded points. In Fast mode, 0.5 real-second frames advance 20 simulated seconds per step. That interval is supported: the screen uses SceneryStack's default `maxDT` of 0.5 s. Such a run records only 400 s and 420 s inside the window. The fit remains null after 430 s, and later recording cannot add missing historical points. With extrapolation enabled by default, calibration consequently remains unavailable even after the water has settled.

Reproduction: leave calibration and extrapolation enabled, select Fast, ignite, and feed the active model 40 calls to `step(0.5)`, representing a 2 fps run. At 800 simulated seconds, the window samples were `[400, 420]`, `driftLineProperty` was null, `calibrationResult` was null, and the actual Use This C_cal button remained disabled. This was not caused by record thinning.

As a control, a fresh Fast trial with 80 calls to `step(0.25)` also reached 800 s, fitted the 400–430 s window, enabled Use This C_cal, and saved 10.200515425 kJ/°C through the actual button.

Suggested correction: decouple measurement sampling from rendered frame cadence by integrating/recording at sufficiently small intervals, or otherwise guarantee a valid fixed-window fit across supported frame durations. Keep the completed fit frozen; do not replace the fixed window with one that drifts indefinitely. Add coarse-frame and irregular-frame regressions that check both the line and calibration availability.

## Validation

- `npm run lint`: passed; 92 files checked, no fixes applied.
- `npm run check`: app, scripts, and test type checks passed.
- `npm test`: all 87 tests passed across nine files, including 17 existing memory-harness tests. The mocked environment emitted text-bounds warnings.
- `npm run build`: passed, including PWA generation; main JavaScript bundle 2,735.53 kB, 884.45 kB gzip.
- `FUZZ_PORT=5267 npm run test:fuzz:quick`: pointer and keyboard fuzz passed with assertions enabled, 10 seconds of fuzz input per mode.
- Baton repository compliance and template drift: passed, including the available remote security-setting probes.
- Actual Step Forward controls: Specific Heat and Coffee Cup advanced by 4/60 simulated seconds at Normal speed; Bomb advanced by 10/60. Playback stayed paused, and ordinary paused frames did not advance the model.
- Bomb calibration positive control: the finer-step trial described above fitted the line and saved its computed value through Use This C_cal.
- All six Hess puzzle solutions were applied in the running app: each solved the target equation and matched its target enthalpy to floating-point round-off. Formation-route rendering produced no page exceptions.
- Development probes reproduced both findings without page exceptions. Screenshots inspected at 1440 × 1000 covered all four screens, including the erroneous Coffee Cup calculation and the unavailable coarse-frame calibration.
- Production preview on port 5269: all four screens opened with assertions enabled and no page exceptions.

## Limits

The deterministic browser checks were review probes, not additions to the repository's test suite. The source review checked implemented equations against the project's documented model and existing analytic tests; data tables and standard enthalpies were not independently revalidated against external references.

This is not a full release sign-off. Sustained performance/heap comparisons, touch/mobile layouts, projector mode, comprehensive runtime localization, randomized listener order, and manual screen-reader use were not completed. Passing short fuzz does not exclude the two demonstrated failures.

## Resolution

Both findings were addressed on 2026-10-30:

- Coffee Cup retains the minimum for an endothermic trial and the maximum for an exothermic trial. Regression tests cover both directions with starts on opposite sides of room temperature, continued drift past the initial temperature through 3000 s, stable peak-based enthalpy, a preserved extrapolation line, and New Trial resetting the peak.
- Bomb trials divide long calls into simulated intervals no longer than `RECORD_INTERVAL` (0.5 s), applying exact burn-extent increments and recording throughout. The existing fixed fit window and frozen result are preserved. Tests cover ideal and leaky jackets, 0.5-second and irregular real frame durations in Fast mode, calibration stability through 3000 s and record thinning, a single call crossing the entire window, and invalid durations.
- A browser regression exercises the actual Use This C_cal button after the previously failing coarse-frame Fast trial and verifies the saved constant.

All seven added failure regressions and the calibration-button browser regression failed against the reviewed code and passed with the fixes. Follow-up validation passed: all 95 unit tests, the browser regression, 10-second pointer and keyboard fuzz, lint, app/scripts/test type checks, production build, repository compliance, and template drift. The review's remaining release-validation limitations above still apply.
