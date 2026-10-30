# Calorimetry Lab: model

The chemistry and physics behind the four screens, for teachers and developers. Dilute aqueous
solutions are treated as water: density 1.00 g/mL and specific heat 4.184 J/(g·°C). Enthalpies are
standard values at 25 °C; none of them change with temperature over the few degrees a trial
spans.

## Heat flow

Every calorimeter is a set of lumped bodies, each with one temperature T (°C) and a heat
capacity C = m·c (J/°C). Bodies exchange heat through thermal conductances G (W/°C), and a body
can lose heat to the room or gain it from a reaction:

```
Cᵢ dTᵢ/dt = Σⱼ Gᵢⱼ (Tⱼ − Tᵢ) + Gᵢ,room (T_room − Tᵢ) + Pᵢ
```

The equations are integrated with fourth-order Runge–Kutta in substeps no longer than a tenth of
the fastest time constant C/ΣG. With no room links, the exchange terms cancel in pairs, so the
total Σ CᵢTᵢ changes only by the heat the reactions put in.

| Screen | Bodies | Links | Room |
|---|---|---|---|
| Specific Heat | sample (m·c), water (m × 4.184) | G = 2.5 W/°C × (m/50 g)^(2/3) | 0.4 W/°C from the water when not insulated |
| Coffee Cup | solution (m × 4.184), plus 20 J/°C for the cup when not ideal | — | 0.4 W/°C when not ideal |
| Bomb Calorimeter | bomb hardware (1832 J/°C), water (2000 g × 4.184) | 46 W/°C | 1.0 W/°C from the water when not ideal |

The sample's conductance grows with its surface area, so big and small samples settle in a
similar time. The room is at 22 °C (25 °C on the bomb screen).

## Specific heat

Specific heats (J/(g·°C)) are CRC Handbook values at 25 °C, as in OpenStax *Chemistry 2e*
Table 5.1. Densities (g/cm³) only size the block.

| Sample | c | Density |
|---|---|---|
| Aluminum | 0.897 | 2.70 |
| Iron | 0.449 | 7.87 |
| Copper | 0.385 | 8.96 |
| Silver | 0.235 | 10.49 |
| Lead | 0.129 | 11.34 |
| Unknown A (titanium) | 0.523 | 4.51 |
| Unknown B (magnesium) | 1.023 | 1.74 |

When insulated, the two bodies settle at

```
T_f = (m₁c₁T₁ + m₂c₂T₂) / (m₁c₁ + m₂c₂)
```

For example, 50 g of copper at 100 °C dropped into 100 g of water at 20 °C ends at 23.52 °C. The
calculation shows q = mcΔT for each body. For an unknown it instead shows
c = −q_water / (m ΔT_sample).

## Coffee-cup calorimetry

The calorimeter runs at constant pressure, so the heat measured is ΔH.

| Reaction | ΔH (kJ/mol) | Per mole of | Source |
|---|---|---|---|
| H⁺(aq) + OH⁻(aq) → H₂O(l) | −55.84 | H₂O | ΔHf°: H₂O(l) −285.83, OH⁻(aq) −229.99 |
| NH₄NO₃(s) → NH₄⁺ + NO₃⁻ | +25.69 | NH₄NO₃ | CRC enthalpy of solution (∞ dilution) |
| NaOH(s) → Na⁺ + OH⁻ | −44.51 | NaOH | CRC |
| CaCl₂(s) → Ca²⁺ + 2Cl⁻ | −81.3 | CaCl₂ | CRC |
| NH₄Cl(s) → NH₄⁺ + Cl⁻ | +14.78 | NH₄Cl | CRC |
| KNO₃(s) → K⁺ + NO₃⁻ | +34.89 | KNO₃ | CRC |
| Mg(s) + 2H⁺ → Mg²⁺ + H₂(g) | −466.85 | Mg | ΔHf° of Mg²⁺(aq) |

- **Amount.** For neutralization, n is the smaller of n(HCl) and n(NaOH). For magnesium, n is the
  smaller of n(Mg) and n(HCl)/2. A dissolving salt all dissolves: a setup in which it could not is
  refused (see below), so n = m/M is always the amount that dissolved.
- **Mass of solution.** The liquids at 1.00 g/mL plus any solid that dissolves. The hydrogen that
  escapes is ignored.
- **Kinetics.** After mixing, the extent follows ξ(t) = n(1 − e^(−t/τ)), with τ = 3 s for
  neutralization, 8–12 s for dissolving and 15 s for magnesium. The heat −ΔH·Δξ goes into the
  solution each step.
- **Calculation.** q_soln = m c ΔT; q_cup = C_cup ΔT for a non-ideal cup; q_rxn = −(q_soln +
  q_cup); ΔH = q_rxn / n. A worked example: 50.0 mL of 1.00 M HCl plus 50.0 mL of 1.00 M NaOH
  gives 0.0500 mol in 100 g, so ΔT = 2792 J / 418.4 J/°C = 6.67 °C.

### Setups the model covers

The model treats the solution as liquid water with no evaporation and no latent heat, and counts
every gram of salt as dissolved. Mix is unavailable, with a note saying why, when a setup would
leave that range. A trial's temperature stays between its start, the ideal-cup final temperature
T_f = T_i − ΔH·n / (m c), and (in a leaky cup) the 22 °C room, so those three bound every run.

- **Temperature.** All of them must lie between 0 °C and 60 °C. At 60 °C water's vapour pressure
  is about 20 kPa: the hydrogen escaping from Mg + HCl leaves saturated with water vapour
  (0.25 mol of H₂O per mole of H₂, about 11 kJ per mole of Mg, 2 % of ΔH), and an open foam cup
  of hot solution is no longer safe to handle. Above that the missing latent heat makes the
  answer visibly wrong. Example: 0.60 g of Mg in 25 mL of 2.0 M HCl from 22 °C would reach
  130 °C, so it is refused. Strong NaOH solutions (10 g in 50 mL from above about 16 °C) are
  refused for the same reason. The coldest any allowed setup gets is 2 °C (10 g of NH₄NO₃ in
  50 mL from 15 °C), so the lower limit never binds.
- **Solubility.** At the coldest temperature of the run, the salt per 100 g of water must not
  exceed its solubility. Only KNO₃ can exceed it within the ranges (up to 20 g per 100 g of
  water). Its solubility is interpolated linearly in the manufacturer's table (Haifa Group
  product catalogue, potassium nitrate: 13.9 g at 0 °C, 21.2 g at 10 °C, 31.6 g at 20 °C;
  Fertilizers Europe's storage guide gives 13.3 g at 0 °C and 31.6 g at 20 °C) and held at
  31.6 g above 20 °C. Example: 10 g in 50 mL from 15 °C would cool to 1.3 °C, where only
  14.8 g per 100 g dissolve, so it is refused. In 50 mL from 15 °C the limit is about 8.2 g.
  The other salts stay well under their solubility at 0 °C (NH₄Cl, the least soluble, still
  takes 29 g per 100 g of water).

### Extrapolating ΔT

In a real cup the reaction takes time and heat leaks out meanwhile, so the peak temperature is
too low. Once the reaction is over the temperature drifts slowly toward room temperature. The sim
fits a least-squares line to that drift over a fixed 30 s window that opens nine reaction time
constants after mixing (27 s for neutralization, 135 s for magnesium), when the reaction is
99.99 % complete, and evaluates the line at t = 0. That gives the temperature an instantaneous
reaction would have reached.

The drift is really an exponential approach to room temperature (C/G ≈ 1100 s for the leaky
cup), so the window has to stay fixed. A window that grew with the run would follow the curve
further and further from the start: the old later-half-of-the-drift fit gave −55.0, −49.1 and
−37.2 kJ/mol for HCl + NaOH at 300, 900 and 1800 s. Once its window has been recorded, the line
is kept as it is, so neither later drift nor the record's thinning moves it. In an ideal cup the
line is flat and the result is the plateau to within 0.06 %. In a leaky cup started at room
temperature the result is within 0.5 % of the accepted ΔH, against 1.6 to 9.3 % for the peak.
Started 8 °C from room temperature the cup drifts before the reaction does, and the straight line
misses by up to 1.6 % (the peak by up to 15 %).

## Bomb calorimetry

The bomb has a fixed volume, so the heat it measures is the change in internal energy, ΔcU. The
enthalpy follows from

```
ΔcH = ΔcU + Δn(gas)·RT,   R = 8.314 J/(mol·K), T = 298.15 K
```

where Δn(gas) counts moles of gas in the products minus the reactants, with water liquid.

| Sample | Formula | M (g/mol) | Δn(gas) | Value used |
|---|---|---|---|---|
| Benzoic acid | C₇H₆O₂(s) | 122.123 | −1/2 | ΔcU = −26.434 kJ/g (certified calibration standard, NIST SRM 39j) |
| Sucrose | C₁₂H₂₂O₁₁(s) | 342.297 | 0 | ΔcH° = −5644 kJ/mol |
| Glucose | C₆H₁₂O₆(s) | 180.156 | 0 | ΔcH° = −2803 kJ/mol |
| Naphthalene | C₁₀H₈(s) | 128.174 | −2 | ΔcH° = −5156 kJ/mol |
| Ethanol | C₂H₅OH(l) | 46.069 | −1 | ΔcH° = −1367 kJ/mol |

ΔcH° values are from the NIST Chemistry WebBook, rounded to 1 kJ/mol. The calorimeter holds 2000 g
of water (8368 J/°C) plus 1832 J/°C of hardware, so C_cal = 10.20 kJ/°C. Burning 1.000 g of
benzoic acid raises the water by 26.434 / 10.20 = 2.592 °C.

The sample burns in a few seconds, but the heat then spreads from the bomb into the water with a
time constant of 1 / (G (1/C_bomb + 1/C_water)) ≈ 33 s. A calibration is therefore only offered
400 s after ignition (12 time constants), when the water holds the heat. With Extrapolate ΔT on,
it also waits for the drift line, fitted from 400 s to 430 s. Before then ΔT is too small and
C_cal = q/ΔT is far too large: 66 kJ/°C at 7 s, when the burn is 99 % done, and still 12.2 kJ/°C
at 60 s. "Use This C_cal" saves exactly the value the calculation shows. A value outside the
5–15 kJ/°C the C_cal control accepts is refused rather than clamped. An ideal jacket calibrates
to 10.200 kJ/°C. A leaky jacket calibrates to 10.18 kJ/°C with the extrapolation (the
straight-line method slightly over-corrects for the heat lost while the water was rising) and to
10.40 kJ/°C from the uncorrected peak.

Simplifications: the heat from the fuse wire, the formation of nitric acid from trapped N₂, and
the departure from standard states inside the bomb (the Washburn corrections) are all ignored.

## Hess's law

Enthalpies of formation ΔHf° (kJ/mol, 25 °C) are from the NIST Chemistry WebBook, as in OpenStax
*Chemistry 2e* Appendix G. Elements in their standard states are 0 by definition.

| Species | ΔHf° | Species | ΔHf° |
|---|---|---|---|
| C(s, diamond) | +1.9 | C₂H₂(g) | +226.7 |
| CO(g) | −110.5 | NO₂(g) | +33.2 |
| CO₂(g) | −393.5 | N₂O₄(g) | +9.2 |
| H₂O(l) | −285.8 | SO₂(g) | −296.8 |
| CH₄(g) | −74.6 | SO₃(g) | −395.7 |

Every step's ΔH is computed from this table, so the Hess route and the formation route agree
exactly. With one-decimal data, the combustion of methane comes out −890.5 kJ/mol, against the
−890.4 kJ/mol quoted from more precise values.

| Puzzle | Target | ΔH (kJ) | Solution |
|---|---|---|---|
| Carbon monoxide | C + ½O₂ → CO | −110.5 | C combustion + reversed CO combustion |
| Diamond | C(graphite) → C(diamond) | +1.9 | graphite combustion + reversed diamond combustion |
| Methane | C + 2H₂ → CH₄ | −74.6 | C combustion + 2 × H₂ combustion + reversed CH₄ combustion |
| Acetylene | 2C + H₂ → C₂H₂ | +226.7 | 2 × C combustion + H₂ combustion + reversed C₂H₂ combustion |
| Dinitrogen tetroxide | 2NO₂ → N₂O₄ | −57.2 | 2 × reversed NO₂ formation + N₂O₄ formation |
| Sulfur trioxide | S + 3/2 O₂ → SO₃ | −395.7 | S → SO₂ + ½ × (2SO₂ + O₂ → 2SO₃) |

An equation is stored as signed coefficients, negative for reactants and positive for products.
Reversing negates every coefficient and ΔH. Scaling multiplies both by the same factor. Adding
two equations adds both, so a species on both sides cancels by itself.

The gross sum shows the cancelling before the net equation. For each species on both sides, only
the smaller amount cancels. It is struck out on each side, and the rest stays as a separate,
unstruck term. In the solved carbon-monoxide puzzle the left has 1 O₂ and the right 1/2 O₂, so
the left reads "1/2 O₂ + ~~1/2 O₂~~" and the right "~~1/2 O₂~~". The unstruck terms are exactly
the net equation.
