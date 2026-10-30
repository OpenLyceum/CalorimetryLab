/**
 * describeSetupProblem.ts
 *
 * Says why a coffee-cup setup cannot be mixed, for the note under the amount controls (RichText)
 * or for screen readers (plain words); "" when the setup is fine. Callers depend on the pattern
 * StringProperties so the text follows the locale.
 */

import { StringUtils } from "scenerystack/phetcommon";
import { SOLUTION_TEMPERATURE_RANGE } from "../../CalorimetryLabConstants.js";
import { fixed } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { CoffeeCupReaction, SetupProblem } from "../model/CoffeeCupReactions.js";

export function describeSetupProblem(
  problem: SetupProblem | null,
  reaction: CoffeeCupReaction,
  accessible: boolean,
): string {
  if (!problem) {
    return "";
  }
  const strings = accessible
    ? StringManager.getInstance().getCoffeeCupA11yStrings()
    : StringManager.getInstance().getCoffeeCupStrings();
  if (problem.kind === "temperature") {
    return StringUtils.fillIn(strings.temperatureProblemPatternStringProperty.value, {
      temperature: fixed(problem.temperature, 1),
      min: SOLUTION_TEMPERATURE_RANGE.min,
      max: SOLUTION_TEMPERATURE_RANGE.max,
    });
  }
  return StringUtils.fillIn(strings.solubilityProblemPatternStringProperty.value, {
    temperature: fixed(problem.temperature, 1),
    solubility: fixed(problem.solubility, 1),
    amount: fixed(problem.amount, 1),
    species: reaction.perMoleOf,
  });
}
