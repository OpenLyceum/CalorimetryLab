/**
 * ReactionEquation.ts
 *
 * A chemical equation as signed coefficients (negative for reactants, positive for products)
 * together with its ΔH. Hess's law is then arithmetic: reversing an equation negates every
 * coefficient and ΔH, scaling multiplies both, and adding equations adds both, so a species that
 * appears on both sides cancels by itself.
 */

import { SPECIES, type SpeciesId } from "./Species.js";

/** Coefficients smaller than this count as zero (species cancelled). */
const TOLERANCE = 1e-9;

export type Term = { readonly species: SpeciesId; readonly coefficient: number };

export class ReactionEquation {
  /** Signed coefficients; never contains a zero. */
  public readonly coefficients: ReadonlyMap<SpeciesId, number>;

  /** kJ for the equation as written. */
  public readonly enthalpy: number;

  private constructor(coefficients: ReadonlyMap<SpeciesId, number>, enthalpy: number) {
    this.coefficients = coefficients;
    this.enthalpy = enthalpy;
  }

  /** reactants and products as [coefficient, species] pairs, both with positive coefficients. */
  public static of(
    reactants: readonly (readonly [number, SpeciesId])[],
    products: readonly (readonly [number, SpeciesId])[],
    enthalpy: number,
  ): ReactionEquation {
    const map = new Map<SpeciesId, number>();
    for (const [coefficient, id] of reactants) {
      map.set(id, (map.get(id) ?? 0) - coefficient);
    }
    for (const [coefficient, id] of products) {
      map.set(id, (map.get(id) ?? 0) + coefficient);
    }
    return ReactionEquation.clean(map, enthalpy);
  }

  /** The equation with its ΔH taken from enthalpies of formation: Σ νΔHf°(products) − Σ νΔHf°(reactants). */
  public static fromFormation(
    reactants: readonly (readonly [number, SpeciesId])[],
    products: readonly (readonly [number, SpeciesId])[],
  ): ReactionEquation {
    const equation = ReactionEquation.of(reactants, products, 0);
    return new ReactionEquation(equation.coefficients, equation.formationEnthalpy());
  }

  /** The sum of several equations; the empty sum is the empty equation. */
  public static sum(equations: readonly ReactionEquation[]): ReactionEquation {
    return equations.reduce((total, e) => total.plus(e), ReactionEquation.of([], [], 0));
  }

  private static clean(map: ReadonlyMap<SpeciesId, number>, enthalpy: number): ReactionEquation {
    const cleaned = new Map<SpeciesId, number>();
    for (const [id, coefficient] of map) {
      if (Math.abs(coefficient) > TOLERANCE) {
        cleaned.set(id, coefficient);
      }
    }
    return new ReactionEquation(cleaned, enthalpy);
  }

  public reversed(): ReactionEquation {
    return this.scaled(-1);
  }

  public scaled(factor: number): ReactionEquation {
    const map = new Map<SpeciesId, number>();
    for (const [id, coefficient] of this.coefficients) {
      map.set(id, coefficient * factor);
    }
    return ReactionEquation.clean(map, this.enthalpy * factor);
  }

  public plus(other: ReactionEquation): ReactionEquation {
    const map = new Map(this.coefficients);
    for (const [id, coefficient] of other.coefficients) {
      map.set(id, (map.get(id) ?? 0) + coefficient);
    }
    return ReactionEquation.clean(map, this.enthalpy + other.enthalpy);
  }

  /** Same species with the same coefficients (ΔH is not compared). */
  public matches(other: ReactionEquation): boolean {
    if (this.coefficients.size !== other.coefficients.size) {
      return false;
    }
    for (const [id, coefficient] of this.coefficients) {
      if (Math.abs(coefficient - (other.coefficients.get(id) ?? 0)) > 1e-6) {
        return false;
      }
    }
    return true;
  }

  /** Reactants with positive coefficients, in insertion order. */
  public get reactants(): Term[] {
    return [...this.coefficients]
      .filter(([, c]) => c < 0)
      .map(([species, coefficient]) => ({ species, coefficient: -coefficient }));
  }

  public get products(): Term[] {
    return [...this.coefficients].filter(([, c]) => c > 0).map(([species, coefficient]) => ({ species, coefficient }));
  }

  /** Σ ν ΔHf° over the signed coefficients (kJ). */
  public formationEnthalpy(): number {
    let total = 0;
    for (const [id, coefficient] of this.coefficients) {
      total += coefficient * SPECIES[id].formationEnthalpy;
    }
    return total;
  }

  /** Σ ν ΔHf° of the reactants alone (kJ). */
  public reactantFormationEnthalpy(): number {
    return this.reactants.reduce((sum, term) => sum + term.coefficient * SPECIES[term.species].formationEnthalpy, 0);
  }

  /** Σ ν ΔHf° of the products alone (kJ). */
  public productFormationEnthalpy(): number {
    return this.products.reduce((sum, term) => sum + term.coefficient * SPECIES[term.species].formationEnthalpy, 0);
  }
}

/**
 * A coefficient as a chemist writes it: nothing for 1, a whole number, or a fraction ("1/2",
 * "3/2", "1/4").
 */
export function formatCoefficient(coefficient: number): string {
  if (Math.abs(coefficient - 1) < TOLERANCE) {
    return "";
  }
  for (const denominator of [1, 2, 3, 4, 6]) {
    const numerator = coefficient * denominator;
    if (Math.abs(numerator - Math.round(numerator)) < 1e-6) {
      return denominator === 1 ? `${Math.round(numerator)}` : `${Math.round(numerator)}/${denominator}`;
    }
  }
  return coefficient.toFixed(2);
}

/** One side of an equation, e.g. "2H₂(g) + O₂(g)". */
export function formatSide(terms: readonly Term[], plain: boolean): string {
  return terms
    .map((term) => {
      const coefficient = formatCoefficient(term.coefficient);
      const formula = plain ? SPECIES[term.species].plain : SPECIES[term.species].markup;
      return coefficient === ""
        ? formula
        : coefficient.includes("/")
          ? `${coefficient} ${formula}`
          : `${coefficient}${formula}`;
    })
    .join(" + ");
}

/** The whole equation, e.g. "C(s, graphite) + 1/2 O₂(g) → CO(g)". */
export function formatEquation(equation: ReactionEquation, plain = false): string {
  return `${formatSide(equation.reactants, plain)} → ${formatSide(equation.products, plain)}`;
}
