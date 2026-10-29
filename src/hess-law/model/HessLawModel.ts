/**
 * HessLawModel.ts
 *
 * One puzzle at a time: the student reverses and scales the step reactions until their sum is the
 * target reaction; the ΔH values add the same way. A step's state is a "reversed" flag and a
 * factor from STEP_FACTORS. The model keeps MAX_STEPS step states and a puzzle uses the first few;
 * choosing a puzzle starts it afresh.
 */

import { BooleanProperty, DerivedProperty, NumberProperty, Property, type TReadOnlyProperty } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { applyUse, HESS_PUZZLES, type HessPuzzle, STEP_FACTORS } from "./HessPuzzles.js";
import { ReactionEquation } from "./ReactionEquation.js";

export const MAX_STEPS = 3;

export class StepState {
  public readonly reversedProperty = new BooleanProperty(false);
  public readonly factorProperty = new NumberProperty(1, { validValues: [...STEP_FACTORS] });

  public reset(): void {
    this.reversedProperty.reset();
    this.factorProperty.reset();
  }
}

export class HessLawModel implements TModel {
  public readonly puzzleProperty = new Property<HessPuzzle>(HESS_PUZZLES[0] as HessPuzzle);
  public readonly stepStates: readonly StepState[] = Array.from({ length: MAX_STEPS }, () => new StepState());

  /** Draw the diagram through the elements (enthalpies of formation) instead of the steps. */
  public readonly formationRouteProperty = new BooleanProperty(false);

  /** The steps as the student has reversed and scaled them. */
  public readonly usedStepsProperty: TReadOnlyProperty<ReactionEquation[]>;

  /** Sum of the used steps. */
  public readonly sumProperty: TReadOnlyProperty<ReactionEquation>;

  /** The sum is the target reaction. */
  public readonly solvedProperty: TReadOnlyProperty<boolean>;

  public constructor() {
    const dependencies = [
      this.puzzleProperty,
      ...this.stepStates.flatMap((state) => [state.reversedProperty, state.factorProperty]),
    ];
    this.usedStepsProperty = DerivedProperty.deriveAny(dependencies, () =>
      this.puzzleProperty.value.steps.map((step, i) => {
        const state = this.stepStates[i] as StepState;
        return applyUse(step, { reversed: state.reversedProperty.value, factor: state.factorProperty.value });
      }),
    );
    this.sumProperty = new DerivedProperty([this.usedStepsProperty], (steps) => ReactionEquation.sum(steps));
    this.solvedProperty = new DerivedProperty([this.sumProperty, this.puzzleProperty], (sum, puzzle) =>
      sum.matches(puzzle.target),
    );
    this.puzzleProperty.lazyLink(() => this.resetSteps());
  }

  public resetSteps(): void {
    for (const state of this.stepStates) {
      state.reset();
    }
  }

  public reset(): void {
    this.puzzleProperty.reset();
    this.formationRouteProperty.reset();
    this.resetSteps();
  }

  public step(_dt: number): void {
    // Nothing changes with time on this screen.
  }
}
