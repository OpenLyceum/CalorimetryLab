/**
 * Species.ts
 *
 * Every substance in the Hess's-law puzzles, with its formula (RichText markup and plain Unicode
 * for screen readers) and its standard enthalpy of formation ΔHf° at 25 °C in kJ/mol (NIST
 * Chemistry WebBook, as in OpenStax Chemistry 2e Appendix G). Elements in their standard states
 * have ΔHf° = 0 by definition; diamond is not the standard state of carbon.
 */

export type SpeciesId =
  | "graphite"
  | "diamond"
  | "O2"
  | "CO"
  | "CO2"
  | "H2"
  | "H2O"
  | "CH4"
  | "C2H2"
  | "N2"
  | "NO2"
  | "N2O4"
  | "S"
  | "SO2"
  | "SO3";

export type Species = {
  readonly id: SpeciesId;
  /** Formula with state, as RichText markup. */
  readonly markup: string;
  /** Formula with state, in plain Unicode. */
  readonly plain: string;
  /** kJ/mol */
  readonly formationEnthalpy: number;
  /** An element in its standard state. */
  readonly element: boolean;
};

function species(id: SpeciesId, markup: string, plain: string, formationEnthalpy: number): Species {
  return { id, markup, plain, formationEnthalpy, element: formationEnthalpy === 0 };
}

export const SPECIES: Readonly<Record<SpeciesId, Species>> = {
  graphite: species("graphite", "C(s, graphite)", "C(s, graphite)", 0),
  diamond: species("diamond", "C(s, diamond)", "C(s, diamond)", 1.9),
  O2: species("O2", "O<sub>2</sub>(g)", "O₂(g)", 0),
  CO: species("CO", "CO(g)", "CO(g)", -110.5),
  CO2: species("CO2", "CO<sub>2</sub>(g)", "CO₂(g)", -393.5),
  H2: species("H2", "H<sub>2</sub>(g)", "H₂(g)", 0),
  H2O: species("H2O", "H<sub>2</sub>O(l)", "H₂O(l)", -285.8),
  CH4: species("CH4", "CH<sub>4</sub>(g)", "CH₄(g)", -74.6),
  C2H2: species("C2H2", "C<sub>2</sub>H<sub>2</sub>(g)", "C₂H₂(g)", 226.7),
  N2: species("N2", "N<sub>2</sub>(g)", "N₂(g)", 0),
  NO2: species("NO2", "NO<sub>2</sub>(g)", "NO₂(g)", 33.2),
  N2O4: species("N2O4", "N<sub>2</sub>O<sub>4</sub>(g)", "N₂O₄(g)", 9.2),
  S: species("S", "S(s)", "S(s)", 0),
  SO2: species("SO2", "SO<sub>2</sub>(g)", "SO₂(g)", -296.8),
  SO3: species("SO3", "SO<sub>3</sub>(g)", "SO₃(g)", -395.7),
};
