/**
 * grossSum.test.ts
 *
 * The gross sum strikes out only the amount of a species that appears on both sides, and what it
 * leaves unstruck is exactly the net equation.
 */

import { describe, expect, it } from "vitest";
import { formatGrossSum, type GrossSum, type GrossTerm, grossSum } from "../../src/hess-law/model/grossSum.js";
import { HessLawModel } from "../../src/hess-law/model/HessLawModel.js";
import { applyUse, HESS_PUZZLES, STEP_FACTORS } from "../../src/hess-law/model/HessPuzzles.js";
import { ReactionEquation } from "../../src/hess-law/model/ReactionEquation.js";
import type { SpeciesId } from "../../src/hess-law/model/Species.js";

/** Marks a struck-out term so the plain text shows what is cancelled. */
const strike = (term: string) => `[${term}]`;

/** The gross sum in plain text of the carbon-monoxide puzzle's steps as the student has them. */
function carbonMonoxide(reversed: boolean, factor: number): string {
  const model = new HessLawModel();
  model.stepStates[1]?.reversedProperty.set(reversed);
  model.stepStates[1]?.factorProperty.set(factor);
  return formatGrossSum(grossSum(model.usedStepsProperty.value), strike, true);
}

describe("gross sum", () => {
  it("strikes out only the 1/2 O₂ that cancels in the solved carbon-monoxide puzzle", () => {
    // C + O₂ → CO₂ plus CO₂ → CO + 1/2 O₂: 1/2 O₂ cancels, 1/2 O₂ is left on the left.
    expect(carbonMonoxide(true, 1)).toBe(
      "C(s, graphite) + 1/2 O₂(g) + [1/2 O₂(g)] + [CO₂(g)] → [CO₂(g)] + CO(g) + [1/2 O₂(g)]",
    );
  });

  it("splits unequal amounts on both sides when the reversed step is halved", () => {
    // C + O₂ → CO₂ plus 1/2 CO₂ → 1/2 CO + 1/4 O₂.
    expect(carbonMonoxide(true, 0.5)).toBe(
      "C(s, graphite) + 3/4 O₂(g) + [1/4 O₂(g)] + [1/2 CO₂(g)] → 1/2 CO₂(g) + [1/2 CO₂(g)] + 1/2 CO(g) + [1/4 O₂(g)]",
    );
  });

  it("strikes nothing when no species is on both sides", () => {
    expect(carbonMonoxide(false, 1)).toBe("C(s, graphite) + 3/2 O₂(g) + CO(g) → 2CO₂(g)");
  });

  it("strikes whole terms that cancel completely", () => {
    const burn = ReactionEquation.of(
      [
        [1, "graphite"],
        [1, "O2"],
      ],
      [[1, "CO2"]],
      -393.5,
    );
    const sum = grossSum([burn, burn.reversed()]);
    expect(formatGrossSum(sum, strike, true)).toBe(
      "[C(s, graphite)] + [O₂(g)] + [CO₂(g)] → [CO₂(g)] + [C(s, graphite)] + [O₂(g)]",
    );
  });

  it("leaves exactly the net equation unstruck, for every puzzle and every way of using its steps", () => {
    for (const puzzle of HESS_PUZZLES) {
      for (const steps of everyUse(puzzle.steps)) {
        const sum = grossSum(steps);
        const net = ReactionEquation.sum(steps);
        const remaining = signedTotals(sum, (term) => term.remaining);
        for (const [species, amount] of remaining) {
          expect(amount, `${puzzle.id} ${species}`).toBeCloseTo(net.coefficients.get(species) ?? 0, 9);
        }
        // Equal amounts are struck on the two sides, and a species is never left on both.
        for (const amount of signedTotals(sum, (term) => term.cancelled).values()) {
          expect(amount).toBeCloseTo(0, 9);
        }
        for (const term of sum.reactants) {
          const other = sum.products.find((p) => p.species === term.species);
          expect(term.remaining > 0 && (other?.remaining ?? 0) > 0).toBe(false);
        }
      }
    }
  });
});

/** The steps under every combination of reversing and factor. */
function everyUse(steps: readonly ReactionEquation[]): ReactionEquation[][] {
  const uses = [false, true].flatMap((reversed) => STEP_FACTORS.map((factor) => ({ reversed, factor })));
  let choices: ReactionEquation[][] = [[]];
  for (const step of steps) {
    choices = choices.flatMap((chosen) => uses.map((use) => [...chosen, applyUse(step, use)]));
  }
  return choices;
}

/** Products minus reactants of one amount of each gross term, by species. */
function signedTotals(sum: GrossSum, amount: (term: GrossTerm) => number): Map<SpeciesId, number> {
  const totals = new Map<SpeciesId, number>();
  for (const term of sum.reactants) {
    totals.set(term.species, (totals.get(term.species) ?? 0) - amount(term));
  }
  for (const term of sum.products) {
    totals.set(term.species, (totals.get(term.species) ?? 0) + amount(term));
  }
  return totals;
}
