/**
 * ThermalNetwork.test.ts
 *
 * Energy conservation, the closed-form final temperature, sources and room leaks.
 */

import { describe, expect, it } from "vitest";
import { ThermalNetwork } from "../../src/common/model/ThermalNetwork.js";

describe("ThermalNetwork", () => {
  it("rejects incomplete body data and invalid link endpoints", () => {
    expect(() => new ThermalNetwork([100], [], [], 20)).toThrow(RangeError);
    expect(() => new ThermalNetwork([100], [40], [{ a: 0, b: 1, conductance: 1 }], 20)).toThrow(RangeError);
    const network = new ThermalNetwork([100], [40], [], 20);
    expect(() => network.getTemperature(1)).toThrow(RangeError);
    expect(() => network.setRoomConductance(1, 1)).toThrow(RangeError);
    expect(network.energy).toBe(4000);
  });

  it("conserves Σ C·T between linked bodies and settles at the weighted mean", () => {
    // 50 g of copper (0.385 J/(g·°C)) at 100 °C into 100 g of water at 20 °C.
    const network = new ThermalNetwork([50 * 0.385, 100 * 4.184], [100, 20], [{ a: 0, b: 1, conductance: 2.5 }], 22);
    const energy = network.energy;
    for (let i = 0; i < 600; i++) {
      network.step(0.5);
    }
    expect(network.energy).toBeCloseTo(energy, 6);
    const copper = network.getTemperature(0);
    const water = network.getTemperature(1);
    expect(copper).toBeCloseTo(23.52, 2);
    expect(water).toBeCloseTo(23.52, 2);
  });

  it("stays stable with a frame step far longer than the time constant", () => {
    const network = new ThermalNetwork([1, 1000], [100, 20], [{ a: 0, b: 1, conductance: 50 }], 22);
    network.step(60);
    const hot = network.getTemperature(0);
    const cold = network.getTemperature(1);
    expect(hot).toBeCloseTo(cold, 3);
    expect(hot).toBeGreaterThan(20);
    expect(hot).toBeLessThan(100);
  });

  it("adds a source's heat exactly", () => {
    const network = new ThermalNetwork([418.4], [22], [], 22);
    network.step(10, [279.2]);
    expect(network.getTemperature(0)).toBeCloseTo(22 + 2792 / 418.4, 9);
  });

  it("relaxes toward the room through a leak", () => {
    const network = new ThermalNetwork([100], [40], [], 20);
    network.setRoomConductance(0, 1);
    network.step(100);
    // τ = C/G = 100 s, so the excess falls by e.
    expect(network.getTemperature(0)).toBeCloseTo(20 + 20 / Math.E, 4);
  });

  it("reports the heat flow along a link", () => {
    const network = new ThermalNetwork([10, 10], [30, 20], [{ a: 0, b: 1, conductance: 2 }], 20);
    expect(network.heatFlow(0, 1)).toBe(20);
    expect(network.heatFlow(1, 0)).toBe(-20);
  });
});
