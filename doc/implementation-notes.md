# Calorimetry Lab: implementation notes

How the code is organised and why. The chemistry is in [`model.md`](model.md).

## Layout of the code

```
src/
  common/model/      ThermalNetwork, TemperatureRecord, extrapolation, ExperimentPhase, timeScale
  common/view/       TemperatureChartNode, ThermometerReadoutNode, FoamCupNode, ControlFactory,
                     RichTextLines, liquidTint, formatValues, createTimeControl, disposeChildren
  specific-heat/     Samples, SpecificHeatModel; apparatus, screen view, summary, keyboard help
  coffee-cup/        CoffeeCupReactions, coffeeCupAnalysis, CoffeeCupModel; apparatus, view, …
  bomb/              Fuels, bombAnalysis, BombCalorimeterModel; apparatus, view, …
  hess-law/          Species, ReactionEquation, HessPuzzles, HessLawModel; StepCardNode,
                     EnthalpyDiagramNode, view, …
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
- **Pure analysis functions.** `analyzeCoffeeCup`, `bombDeltaT`, `calibratedConstant` and
  `measure` take plain values. The view, the summaries and the tests call the same code.
- **Drift line from the later half of the post-peak record.** Fitting from the peak itself would
  include the tail of the reaction, which bends the line. The later half is past the reaction for
  every τ used (≤ 15 s) once 30 s of drift have passed. Before then the calculation uses the peak
  and says so.
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
- **Strike-through in RichText.** The gross sum marks cancelling species with `<s>` inside a
  `<span style="color: …">` whose colour is the profile colour's CSS at render time. The view
  re-renders when that colour changes, so projector mode stays correct.
- **Colours and tints.** Exothermic is warm (orange/red), endothermic cool (blue), in arrows and
  tints alike. A solution warming because of an exothermic reaction turns toward the exothermic
  colour.

## Possible extensions

- Heat-of-fusion screen: an ice cube melting in the coffee cup, with ΔHfus.
- Fuse-wire and nitric-acid (Washburn) corrections as an advanced option on the bomb screen.
- A "build your own Hess puzzle" mode choosing any target from the ΔHf° table.
- Measurement noise on the thermometer, for error analysis.
