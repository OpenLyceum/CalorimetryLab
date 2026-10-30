/**
 * grossSum.ts
 *
 * The steps added up before anything cancels: every species each side collects, split into the
 * amount that cancels against the other side and the amount that remains. With 1 O₂ on the left
 * and 1/2 O₂ on the right, 1/2 O₂ cancels from each side and 1/2 O₂ remains on the left, which
 * is what the net equation keeps.
 */

import { formatTerm, type ReactionEquation } from "./ReactionEquation.js";
import type { SpeciesId } from "./Species.js";

/** Amounts smaller than this count as zero. */
const TOLERANCE = 1e-9;

export type GrossTerm = {
  readonly species: SpeciesId;
  /** Amount left after cancelling (≥ 0). */
  readonly remaining: number;
  /** Amount that cancels against the other side (≥ 0). */
  readonly cancelled: number;
};

export type GrossSum = {
  readonly reactants: readonly GrossTerm[];
  readonly products: readonly GrossTerm[];
};

/** Every species the steps put on each side, in order of first appearance. */
export function grossSum(steps: readonly ReactionEquation[]): GrossSum {
  const left = new Map<SpeciesId, number>();
  const right = new Map<SpeciesId, number>();
  for (const step of steps) {
    for (const term of step.reactants) {
      left.set(term.species, (left.get(term.species) ?? 0) + term.coefficient);
    }
    for (const term of step.products) {
      right.set(term.species, (right.get(term.species) ?? 0) + term.coefficient);
    }
  }
  const side = (totals: ReadonlyMap<SpeciesId, number>, other: ReadonlyMap<SpeciesId, number>): GrossTerm[] =>
    [...totals].map(([species, total]) => {
      const cancelled = Math.min(total, other.get(species) ?? 0);
      const remaining = total - cancelled;
      return {
        species,
        remaining: remaining > TOLERANCE ? remaining : 0,
        cancelled: cancelled > TOLERANCE ? cancelled : 0,
      };
    });
  return { reactants: side(left, right), products: side(right, left) };
}

/**
 * One side of the gross sum: each species' remaining amount as a plain term, followed by its
 * cancelled amount passed through `strike` (e.g. "C + 1/2 O₂ + <s>1/2 O₂</s>").
 */
export function formatGrossSide(terms: readonly GrossTerm[], strike: (term: string) => string, plain = false): string {
  return terms
    .flatMap((term) => [
      ...(term.remaining > 0 ? [formatTerm({ species: term.species, coefficient: term.remaining }, plain)] : []),
      ...(term.cancelled > 0
        ? [strike(formatTerm({ species: term.species, coefficient: term.cancelled }, plain))]
        : []),
    ])
    .join(" + ");
}

/** The whole gross sum, reactants → products. */
export function formatGrossSum(sum: GrossSum, strike: (term: string) => string, plain = false): string {
  return `${formatGrossSide(sum.reactants, strike, plain)} → ${formatGrossSide(sum.products, strike, plain)}`;
}
