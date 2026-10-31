import { expect, test } from "@playwright/test";
import type { TimeSpeed } from "scenerystack/scenery-phet";
import type { BombCalorimeterModel } from "../../src/bomb/model/BombCalorimeterModel.js";

type SimulationWindow = {
  phet: {
    sceneryPhet: Record<"TimeSpeed", typeof TimeSpeed>;
    joist: { sim: { selectedScreenProperty: { value: { model: BombCalorimeterModel } } } };
  };
};

test("a coarse-frame Fast trial enables and saves the bomb calibration", async ({ page }) => {
  await page.goto("/?screens=3&ea");
  await page.getByRole("button", { name: "Ignite", exact: true }).waitFor();
  await page.evaluate(() => {
    const phet = (window as unknown as SimulationWindow).phet;
    const model = phet.joist.sim.selectedScreenProperty.value.model;
    model.timeSpeedProperty.value = phet.sceneryPhet.TimeSpeed.FAST;
    model.ignite();
    for (let frame = 0; frame < 40; frame++) {
      model.step(0.5);
    }
    model.timer.isPlayingProperty.value = false;
  });
  const useCalibration = page.getByRole("button", { name: "Use This C_cal", exact: true });
  await expect(useCalibration).toBeEnabled();
  await useCalibration.press("Enter");
  const saved = await page.evaluate(
    () =>
      (window as unknown as SimulationWindow).phet.joist.sim.selectedScreenProperty.value.model
        .calorimeterConstantProperty.value,
  );
  expect(saved).toBeCloseTo(10.2, 3);
});
