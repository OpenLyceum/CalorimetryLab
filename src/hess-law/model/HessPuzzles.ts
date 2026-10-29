/**
 * HessPuzzles.ts
 *
 * Each puzzle is a target reaction and the step reactions to build it from. Every step's ΔH comes
 * from the enthalpies of formation in Species.ts, so the steps, the targets and the formation
 * route always agree to the 0.1 kJ the table carries. `solution` records how each step must be
 * used (reversed or not, and by what factor); the tests check it reproduces the target.
 */

import { ReactionEquation } from "./ReactionEquation.js";

export type HessPuzzleId =
  | "carbonMonoxide"
  | "diamond"
  | "methane"
  | "acetylene"
  | "dinitrogenTetroxide"
  | "sulfurTrioxide";

export type StepUse = { readonly reversed: boolean; readonly factor: number };

export type HessPuzzle = {
  readonly id: HessPuzzleId;
  readonly target: ReactionEquation;
  readonly steps: readonly ReactionEquation[];
  readonly solution: readonly StepUse[];
};

/** Factors a step can be multiplied by. */
export const STEP_FACTORS = [0.5, 1, 2, 3] as const;

const f = ReactionEquation.fromFormation;

// Combustion steps shared by several puzzles.
const burnGraphite = f(
  [
    [1, "graphite"],
    [1, "O2"],
  ],
  [[1, "CO2"]],
);
const burnHydrogen = f(
  [
    [1, "H2"],
    [0.5, "O2"],
  ],
  [[1, "H2O"]],
);

export const HESS_PUZZLES: readonly HessPuzzle[] = [
  {
    id: "carbonMonoxide",
    target: f(
      [
        [1, "graphite"],
        [0.5, "O2"],
      ],
      [[1, "CO"]],
    ),
    steps: [
      burnGraphite,
      f(
        [
          [1, "CO"],
          [0.5, "O2"],
        ],
        [[1, "CO2"]],
      ),
    ],
    solution: [
      { reversed: false, factor: 1 },
      { reversed: true, factor: 1 },
    ],
  },
  {
    id: "diamond",
    target: f([[1, "graphite"]], [[1, "diamond"]]),
    steps: [
      burnGraphite,
      f(
        [
          [1, "diamond"],
          [1, "O2"],
        ],
        [[1, "CO2"]],
      ),
    ],
    solution: [
      { reversed: false, factor: 1 },
      { reversed: true, factor: 1 },
    ],
  },
  {
    id: "methane",
    target: f(
      [
        [1, "graphite"],
        [2, "H2"],
      ],
      [[1, "CH4"]],
    ),
    steps: [
      burnGraphite,
      burnHydrogen,
      f(
        [
          [1, "CH4"],
          [2, "O2"],
        ],
        [
          [1, "CO2"],
          [2, "H2O"],
        ],
      ),
    ],
    solution: [
      { reversed: false, factor: 1 },
      { reversed: false, factor: 2 },
      { reversed: true, factor: 1 },
    ],
  },
  {
    id: "acetylene",
    target: f(
      [
        [2, "graphite"],
        [1, "H2"],
      ],
      [[1, "C2H2"]],
    ),
    steps: [
      burnGraphite,
      burnHydrogen,
      f(
        [
          [1, "C2H2"],
          [2.5, "O2"],
        ],
        [
          [2, "CO2"],
          [1, "H2O"],
        ],
      ),
    ],
    solution: [
      { reversed: false, factor: 2 },
      { reversed: false, factor: 1 },
      { reversed: true, factor: 1 },
    ],
  },
  {
    id: "dinitrogenTetroxide",
    target: f([[2, "NO2"]], [[1, "N2O4"]]),
    steps: [
      f(
        [
          [0.5, "N2"],
          [1, "O2"],
        ],
        [[1, "NO2"]],
      ),
      f(
        [
          [1, "N2"],
          [2, "O2"],
        ],
        [[1, "N2O4"]],
      ),
    ],
    solution: [
      { reversed: true, factor: 2 },
      { reversed: false, factor: 1 },
    ],
  },
  {
    id: "sulfurTrioxide",
    target: f(
      [
        [1, "S"],
        [1.5, "O2"],
      ],
      [[1, "SO3"]],
    ),
    steps: [
      f(
        [
          [1, "S"],
          [1, "O2"],
        ],
        [[1, "SO2"]],
      ),
      f(
        [
          [2, "SO2"],
          [1, "O2"],
        ],
        [[2, "SO3"]],
      ),
    ],
    solution: [
      { reversed: false, factor: 1 },
      { reversed: false, factor: 0.5 },
    ],
  },
];

/** A step as the student has it: reversed and/or multiplied. */
export function applyUse(step: ReactionEquation, use: StepUse): ReactionEquation {
  return step.scaled(use.reversed ? -use.factor : use.factor);
}
