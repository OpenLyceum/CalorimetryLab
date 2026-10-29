/**
 * Fuels.ts
 *
 * Samples burned in the bomb calorimeter. Benzoic acid is the calibration standard: its energy of
 * combustion under bomb conditions is certified as ΔcU = −26.434 kJ/g (NIST SRM 39j). The others
 * carry standard enthalpies of combustion ΔcH° at 25 °C with liquid water as a product (NIST
 * Chemistry WebBook); the bomb measures ΔcU = ΔcH° − Δn(gas)·RT, since it runs at constant volume.
 * Sources and the Δn(gas) bookkeeping are in doc/model.md.
 */

import { GAS_CONSTANT, STANDARD_TEMPERATURE } from "../../CalorimetryLabConstants.js";

export type FuelId = "benzoicAcid" | "sucrose" | "glucose" | "naphthalene" | "ethanol";

export type Fuel = {
  readonly id: FuelId;
  /** Formula as RichText markup. */
  readonly formula: string;
  /** Balanced combustion equation as RichText markup. */
  readonly equation: string;
  /** g/mol */
  readonly molarMass: number;
  /** Change in moles of gas per mole of fuel burned (products − reactants). */
  readonly gasMolesChange: number;
  /** Energy of combustion at constant volume (kJ/mol). */
  readonly internalEnergy: number;
};

/** ΔU (kJ/mol) from ΔH (kJ/mol) for a reaction whose gas moles change by Δn. */
export function internalEnergyFromEnthalpy(enthalpy: number, gasMolesChange: number): number {
  return enthalpy - (gasMolesChange * GAS_CONSTANT * STANDARD_TEMPERATURE) / 1000;
}

/** ΔH (kJ/mol) from ΔU (kJ/mol) for a reaction whose gas moles change by Δn. */
export function enthalpyFromInternalEnergy(internalEnergy: number, gasMolesChange: number): number {
  return internalEnergy + (gasMolesChange * GAS_CONSTANT * STANDARD_TEMPERATURE) / 1000;
}

const BENZOIC_ACID_MOLAR_MASS = 122.123;

/** Certified energy of combustion of benzoic acid (kJ/g). */
export const BENZOIC_ACID_ENERGY_PER_GRAM = -26.434;

export const FUELS: Readonly<Record<FuelId, Fuel>> = {
  benzoicAcid: {
    id: "benzoicAcid",
    formula: "C<sub>7</sub>H<sub>6</sub>O<sub>2</sub>",
    equation:
      "C<sub>7</sub>H<sub>6</sub>O<sub>2</sub>(s) + 15/2 O<sub>2</sub>(g) → 7CO<sub>2</sub>(g) + 3H<sub>2</sub>O(l)",
    molarMass: BENZOIC_ACID_MOLAR_MASS,
    gasMolesChange: -0.5,
    internalEnergy: BENZOIC_ACID_ENERGY_PER_GRAM * BENZOIC_ACID_MOLAR_MASS,
  },
  sucrose: {
    id: "sucrose",
    formula: "C<sub>12</sub>H<sub>22</sub>O<sub>11</sub>",
    equation:
      "C<sub>12</sub>H<sub>22</sub>O<sub>11</sub>(s) + 12O<sub>2</sub>(g) → 12CO<sub>2</sub>(g) + 11H<sub>2</sub>O(l)",
    molarMass: 342.297,
    gasMolesChange: 0,
    internalEnergy: internalEnergyFromEnthalpy(-5644, 0),
  },
  glucose: {
    id: "glucose",
    formula: "C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>",
    equation:
      "C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>(s) + 6O<sub>2</sub>(g) → 6CO<sub>2</sub>(g) + 6H<sub>2</sub>O(l)",
    molarMass: 180.156,
    gasMolesChange: 0,
    internalEnergy: internalEnergyFromEnthalpy(-2803, 0),
  },
  naphthalene: {
    id: "naphthalene",
    formula: "C<sub>10</sub>H<sub>8</sub>",
    equation: "C<sub>10</sub>H<sub>8</sub>(s) + 12O<sub>2</sub>(g) → 10CO<sub>2</sub>(g) + 4H<sub>2</sub>O(l)",
    molarMass: 128.174,
    gasMolesChange: -2,
    internalEnergy: internalEnergyFromEnthalpy(-5156, -2),
  },
  ethanol: {
    id: "ethanol",
    formula: "C<sub>2</sub>H<sub>5</sub>OH",
    equation: "C<sub>2</sub>H<sub>5</sub>OH(l) + 3O<sub>2</sub>(g) → 2CO<sub>2</sub>(g) + 3H<sub>2</sub>O(l)",
    molarMass: 46.069,
    gasMolesChange: -1,
    internalEnergy: internalEnergyFromEnthalpy(-1367, -1),
  },
};

/** The samples of the Measure mode (benzoic acid can be measured too, as a check). */
export const FUEL_LIST: readonly Fuel[] = Object.values(FUELS);

/** Heat a sample of `mass` grams releases at constant volume (J, positive). */
export function heatReleased(fuel: Fuel, mass: number): number {
  return (-fuel.internalEnergy * 1000 * mass) / fuel.molarMass;
}
