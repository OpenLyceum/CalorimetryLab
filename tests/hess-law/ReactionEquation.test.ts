/**
 * ReactionEquation.test.ts
 *
 * Reversing, scaling and adding equations; every puzzle's intended solution reproduces its target
 * and textbook ΔH.
 */

import { describe, expect, it } from "vitest";
import { HessLawModel } from "../../src/hess-law/model/HessLawModel.js";
import { applyUse, HESS_PUZZLES } from "../../src/hess-law/model/HessPuzzles.js";
import { formatCoefficient, formatEquation, ReactionEquation } from "../../src/hess-law/model/ReactionEquation.js";

const ACCEPTED: Record<string, number> = {
  carbonMonoxide: -110.5,
  diamond: 1.9,
  methane: -74.6,
  acetylene: 226.7,
  dinitrogenTetroxide: -57.2,
  sulfurTrioxide: -395.7,
};

describe("ReactionEquation", () => {
  const burnCarbon = ReactionEquation.of(
    [
      [1, "graphite"],
      [1, "O2"],
    ],
    [[1, "CO2"]],
    -393.5,
  );

  it("reverses coefficients and ΔH", () => {
    const reversed = burnCarbon.reversed();
    expect(reversed.enthalpy).toBe(393.5);
    expect(formatEquation(reversed, true)).toBe("CO₂(g) → C(s, graphite) + O₂(g)");
  });

  it("scales coefficients and ΔH", () => {
    const half = burnCarbon.scaled(0.5);
    expect(half.enthalpy).toBe(-196.75);
    expect(formatEquation(half, true)).toBe("1/2 C(s, graphite) + 1/2 O₂(g) → 1/2 CO₂(g)");
  });

  it("cancels species that appear on both sides", () => {
    const sum = burnCarbon.plus(burnCarbon.reversed());
    expect(sum.coefficients.size).toBe(0);
    expect(sum.enthalpy).toBe(0);
  });

  it("writes coefficients the way chemists do", () => {
    expect(formatCoefficient(1)).toBe("");
    expect(formatCoefficient(2)).toBe("2");
    expect(formatCoefficient(1.5)).toBe("3/2");
    expect(formatCoefficient(0.25)).toBe("1/4");
  });

  it("computes ΔH from enthalpies of formation", () => {
    const water = ReactionEquation.fromFormation(
      [
        [1, "H2"],
        [0.5, "O2"],
      ],
      [[1, "H2O"]],
    );
    expect(water.enthalpy).toBeCloseTo(-285.8, 9);
  });
});

describe("Hess puzzles", () => {
  for (const puzzle of HESS_PUZZLES) {
    it(`${puzzle.id}: the intended steps add up to the target`, () => {
      const sum = ReactionEquation.sum(
        puzzle.steps.map((step, i) => applyUse(step, puzzle.solution[i] ?? { reversed: false, factor: 1 })),
      );
      expect(sum.matches(puzzle.target)).toBe(true);
      expect(sum.enthalpy).toBeCloseTo(puzzle.target.enthalpy, 6);
      expect(puzzle.target.enthalpy).toBeCloseTo(ACCEPTED[puzzle.id] ?? Number.NaN, 1);
    });

    it(`${puzzle.id}: the steps as given do not already solve it`, () => {
      expect(ReactionEquation.sum(puzzle.steps).matches(puzzle.target)).toBe(false);
    });
  }

  it("the combustion of methane comes out at −890.5 kJ/mol from the one-decimal table", () => {
    const methane = HESS_PUZZLES.find((p) => p.id === "methane");
    expect(methane?.steps[2]?.enthalpy).toBeCloseTo(-890.5, 6);
  });
});

describe("HessLawModel", () => {
  it("is solved once the steps are reversed and scaled correctly", () => {
    const model = new HessLawModel();
    expect(model.solvedProperty.value).toBe(false);
    model.stepStates[1]?.reversedProperty.set(true);
    expect(model.solvedProperty.value).toBe(true);
    expect(model.sumProperty.value.enthalpy).toBeCloseTo(-110.5, 6);
  });

  it("starts a new puzzle afresh", () => {
    const model = new HessLawModel();
    model.stepStates[0]?.factorProperty.set(2);
    model.puzzleProperty.value = HESS_PUZZLES[2] ?? model.puzzleProperty.value;
    expect(model.stepStates[0]?.factorProperty.value).toBe(1);
    expect(model.usedStepsProperty.value).toHaveLength(3);
  });
});
