# Calorimetry Lab: implementation notes

How the code is organised and why. The chemistry is in [`model.md`](model.md).

## Layout of the code

```
src/
  common/model/      ThermalNetwork, TemperatureRecord, extrapolation, ExperimentPhase, timeScale
  common/view/       TemperatureChartNode, ThermometerReadoutNode, FoamCupNode, ControlFactory,
                     RichTextLines, liquidTint, formatValues, createTimeControl, disposeChildren
  specific-heat/     Samples, SpecificHeatModel; apparatus, screen view, summary, keyboard help
  coffee-cup/        CoffeeCupReactions, coffeeCupAnalysis, CoffeeCupModel; apparatus, view,
                     describeSetupProblem, …
  bomb/              Fuels, bombAnalysis, BombCalorimeterModel; apparatus, view, …
  hess-law/          Species, ReactionEquation, HessPuzzles, grossSum, HessLawModel;
                     StepCardNode, EnthalpyDiagramNode, view, …
```

Each screen's model knows nothing about the others. The three calorimeter screens share the heat
engine, the temperature record, the extrapolation and the chart.

## Decisions

- **Lumped bodies, not a field.** HeatTransfer in this fleet simulates conduction as a field on
  the GPU. A calorimeter only needs a few well-stirred bodies, so `ThermalNetwork` integrates a
  small ODE system. RK4 in substeps of at most τ_min/10 keeps it stable at any frame step and
  accurate to about 10⁻⁵ °C, and it conserves Σ C·T exactly when insulated. That conservation is
  what makes q(sample) + q(water) = 0 J show on screen.
- **Heat from reactions by extent, not by rate.** A reaction step computes the change in the
  analytic extent ξ(t) and delivers −ΔH·Δξ as a constant power over the step. The heat delivered
  over a trial is then exact, independent of frame rate and time speed, so the analysis recovers
  ΔH to the precision of the thermometer.
- **A trial is a frozen setup.** Calculating from the live controls would let a student change
  the mass after mixing and break the arithmetic. Each model therefore disables its setup
  controls while running and keeps `trialProperty` for the analysis.
- **Pure analysis functions.** `analyzeCoffeeCup`, `setupProblem`, `bombDeltaT`,
  `calibratedConstant`, `calibrationResult` and `measure` take plain values. The view, the summaries and the tests call the same code.
- **Coffee-cup peak follows the reaction direction.** Endothermic trials keep their minimum;
  exothermic trials keep their maximum. Choosing the largest absolute change from the start would
  let later room drift across that start overwrite the reaction's extremum and reverse ΔH's sign.
- **Bomb measurements resolve long frames.** `BombCalorimeterModel.run` divides a call into
  simulated intervals no longer than `RECORD_INTERVAL` (0.5 s), updating the burn's exact extent
  and recording temperatures throughout. Fast mode at low frame rates therefore still supplies
  enough points in the fixed 400–430 s drift window, including when a single call crosses it.
- **Drift line from a fixed window, then frozen.** `driftLine(trace, fromTime)` fits the 30 s
  after `fromTime`: nine reaction time constants after mixing in the coffee cup, 400 s after
  ignition in the bomb. An earlier window still holds the reaction's tail (or the bomb's heat
  still spreading), which tilts the line even in an ideal calorimeter. A window that grows with
  the run (the first version fitted the later half of the post-peak record) follows the
  exponential drift further from t = 0, so the result crept: −55.0 kJ/mol at 300 s, −37.2 at
  1800 s. Each model computes the line only until it exists and then keeps it, so later points
  and the record's thinning (first at 1200 s, after every window has closed) cannot change it.
  Until then the calculation uses the peak and says when the window closes. An exponential fit
  would fix the curvature, but it is not what the course teaches. With the straight line, the
  error of a leaky cup comes mostly from a start away from room temperature (see `model.md`).
- **Setup limits as a pure check.** `setupProblem` (CoffeeCupReactions.ts) bounds a trial by its
  start, its ideal-cup final temperature and the room. It reports a setup that would pass 60 °C
  (no evaporation or latent heat in the model) or would need more KNO₃ than dissolves at the
  coldest point. The model exposes it as `setupProblemProperty` and `mix()` refuses such a
  setup. The view disables Mix and shows the reason under the amounts, also as the Mix button's
  help text and in the screen summary. Partial dissolution was the alternative, but it would make
  n, the solution mass and the leftover solid depend on temperature during the run. That is more
  than an introductory screen should ask, and it would break "all of it dissolves" in the
  calculation.
- **Calibration only when it is valid.** `calibrationResult` (bombAnalysis.ts) returns C_cal only
  after the water has settled (and the drift line exists, if extrapolating), and only inside the
  C_cal control's range. "Use This C_cal" is enabled by that value and saves it exactly;
  `useCalibration` refuses an out-of-range value instead of clamping it. A test on the burn
  alone (burned > 0.99, the first version) opened the button at 7 s, when ΔT was a tenth of its
  final value. A test on bomb ≈ water would never pass in a leaky jacket, where the bomb stays a
  little warmer while the water loses heat.
- **The record thins itself.** `TemperatureRecord` samples every 0.5 s of simulated time. When it
  reaches 2400 points it drops every other point and doubles the interval, so a long run never
  grows the chart's work without bound.
- **Self-fitting chart.** `TemperatureChartNode` adapts Electrochemistry's NernstChartNode: nice
  tick steps, and a range kept until the data leave it or fill less than a third of it, so the
  axes don't twitch every frame.
- **The hidden calorimeter constant.** The bomb's C_cal appears nowhere in the UI. Measure uses
  the student's value, which starts at 10.00 kJ/°C rather than the true 10.20, so skipping the
  calibration produces a visible 2 % error.
- **One ΔHf° table for Hess's law.** Typing step ΔH values by hand invites rounding
  inconsistencies between routes. `ReactionEquation.fromFormation` derives every step and target
  ΔH from `Species.ts`, and the tests check every puzzle's intended solution.
- **Strike-through in RichText.** `grossSum` (hess-law/model/grossSum.ts) splits each species on
  each side into the amount that cancels, min(left, right), and the amount that remains.
  `formatGrossSum` writes the remainder as a plain term and passes the cancelled amount to a
  `strike` callback. The view's callback wraps it in `<s>` inside a `<span style="color: …">`
  whose colour is the profile colour's CSS at render time. The view re-renders when that colour
  changes, so projector mode stays correct. The tests use a plain-text callback and check, for
  every puzzle and every reversal and factor, that the unstruck terms are the net equation.
- **Colours and tints.** Exothermic is warm (orange/red), endothermic cool (blue), in arrows and
  tints alike. A solution warming because of an exothermic reaction turns toward the exothermic
  colour.

## Possible extensions

- Heat-of-fusion screen: an ice cube melting in the coffee cup, with ΔHfus.
- Fuse-wire and nitric-acid (Washburn) corrections as an advanced option on the bomb screen.
- A "build your own Hess puzzle" mode choosing any target from the ΔHf° table.
- Measurement noise on the thermometer, for error analysis.
