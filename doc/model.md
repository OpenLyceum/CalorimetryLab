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
  smaller of n(Mg) and n(HCl)/2. A dissolving salt all dissolves; the mass ranges stay below
  solubility.
- **Mass of solution.** The liquids at 1.00 g/mL plus any solid that dissolves. The hydrogen that
  escapes is ignored.
- **Kinetics.** After mixing, the extent follows ξ(t) = n(1 − e^(−t/τ)), with τ = 3 s for
  neutralization, 8–12 s for dissolving and 15 s for magnesium. The heat −ΔH·Δξ goes into the
  solution each step.
- **Calculation.** q_soln = m c ΔT; q_cup = C_cup ΔT for a non-ideal cup; q_rxn = −(q_soln +
  q_cup); ΔH = q_rxn / n. A worked example: 50.0 mL of 1.00 M HCl plus 50.0 mL of 1.00 M NaOH
  gives 0.0500 mol in 100 g, so ΔT = 2792 J / 418.4 J/°C = 6.67 °C.

### Extrapolating ΔT

In a real cup the reaction takes time and heat leaks out meanwhile, so the peak temperature is
too low. After the peak the temperature drifts almost linearly toward room temperature. The sim
fits a least-squares line to the later half of the post-peak record, once there are 30 s of
drift, and evaluates it at t = 0. That gives the temperature an instantaneous reaction would have
reached. In the test case (0.50 g of Mg in 100 mL of acid, leaky cup), the peak ΔT
underestimates ΔH by more than 2 %, while the extrapolated ΔT recovers it within 2 %.

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
