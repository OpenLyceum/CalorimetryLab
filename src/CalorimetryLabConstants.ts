/**
 * CalorimetryLabConstants.ts
 *
 * Central repository for every named numeric constant used across the
 * simulation. Bare numbers that carry semantic meaning (sizes, margins,
 * physics defaults, ranges) belong here rather than inline in model or view
 * code, so they are named, documented, and changed in one place.
 *
 * Conventions
 * ───────────
 *  - Chemistry values use the units a student reads in the lab rather than strict
 *    SI: masses in g, volumes in mL, concentrations in mol/L (M), temperatures in
 *    °C, heat in J, heat capacities in J/°C, conductances in W/°C, time in s.
 *    Note the unit in a comment on each value.
 *  - Layout / chrome values are in screen pixels.
 *  - Colour strings live in CalorimetryLabColors.ts, not here.
 *  - Computed expressions (e.g. `2 * Math.PI`) may stay inline.
 */

import { Range } from "scenerystack/dot";
import CalorimetryLabNamespace from "./CalorimetryLabNamespace.js";
import type { TimeScale } from "./common/model/timeScale.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

/** Vertical gap between stacked panels. */
export const PANEL_SPACING = 10;

/** Width of the right-hand control column on every screen. */
export const SIDE_COLUMN_WIDTH = 236;

/** Font sizes (px). */
export const FONT_SIZE = {
  tiny: 11,
  small: 12,
  control: 13,
  label: 14,
  readout: 16,
} as const;

// ── Physical constants ────────────────────────────────────────────────────────

/** Molar gas constant (J/(mol·K)), CODATA 2018 exact value. */
export const GAS_CONSTANT = 8.314462618;

/** Standard temperature for tabulated enthalpies (K). */
export const STANDARD_TEMPERATURE = 298.15;

/** Specific heat of water and of dilute aqueous solutions (J/(g·°C)). */
export const WATER_SPECIFIC_HEAT = 4.184;

/** Density of water and of dilute aqueous solutions (g/mL). */
export const SOLUTION_DENSITY = 1;

/** Temperature of the room around every calorimeter (°C). */
export const ROOM_TEMPERATURE = 22;

/** Two temperatures closer than this count as equal (°C), for "thermal equilibrium" messages. */
export const EQUILIBRIUM_TOLERANCE = 0.05;

// ── Specific Heat screen ──────────────────────────────────────────────────────

/** Sample mass (g). */
export const SAMPLE_MASS_RANGE = new Range(10, 200);
export const SAMPLE_MASS_DEFAULT = 50;

/** Temperature of the hot-water bath that heats the sample (°C). */
export const SAMPLE_TEMPERATURE_RANGE = new Range(40, 100);
export const SAMPLE_TEMPERATURE_DEFAULT = 100;

/** Mass of water in the cup (g). */
export const WATER_MASS_RANGE = new Range(50, 250);
export const WATER_MASS_DEFAULT = 100;

/** Starting temperature of the water in the cup (°C). */
export const WATER_TEMPERATURE_RANGE = new Range(10, 40);
export const WATER_TEMPERATURE_DEFAULT = 20;

/**
 * Sample-to-water thermal conductance for a 50 g sample (W/°C). It scales with the sample's
 * surface area, (m / 50 g)^(2/3), so small and large samples settle in a similar time.
 */
export const SAMPLE_CONDUCTANCE = 2.5;
export const SAMPLE_REFERENCE_MASS = 50;

/** Cup-to-room conductance when the cup is not insulated (W/°C). */
export const CUP_ROOM_CONDUCTANCE = 0.4;

/** Simulated seconds per real second at slow / normal / fast speed. */
export const SPECIFIC_HEAT_TIME_SCALE: TimeScale = { slow: 1, normal: 4, fast: 15 };

// ── Coffee Cup screen ─────────────────────────────────────────────────────────

/** Volume of each solution (mL). */
export const SOLUTION_VOLUME_RANGE = new Range(25, 100);
export const SOLUTION_VOLUME_DEFAULT = 50;

/** Concentration of each solution (M). */
export const SOLUTION_CONCENTRATION_RANGE = new Range(0.5, 2);
export const SOLUTION_CONCENTRATION_DEFAULT = 1;

/** Volume of water a salt dissolves in (mL). */
export const DISSOLVING_VOLUME_RANGE = new Range(50, 200);
export const DISSOLVING_VOLUME_DEFAULT = 100;

/** Mass of salt dissolved (g). */
export const SOLUTE_MASS_RANGE = new Range(1, 10);
export const SOLUTE_MASS_DEFAULT = 5;

/** Mass of magnesium ribbon added to the acid (g). */
export const METAL_MASS_RANGE = new Range(0.05, 0.6);
export const METAL_MASS_DEFAULT = 0.25;

/** Starting temperature of the solutions (°C). */
export const INITIAL_TEMPERATURE_RANGE = new Range(15, 30);

/** Heat capacity of a real (non-ideal) pair of foam cups, lid and thermometer (J/°C). */
export const CUP_HEAT_CAPACITY = 20;

/** Simulated seconds per real second at slow / normal / fast speed. */
export const COFFEE_CUP_TIME_SCALE: TimeScale = { slow: 1, normal: 4, fast: 15 };

// ── Bomb Calorimeter screen ───────────────────────────────────────────────────

/** Mass of water in the bucket around the bomb (g). */
export const BUCKET_WATER_MASS = 2000;

/**
 * Heat capacity of the bomb, bucket, stirrer and thermometer (J/°C). With the water the whole
 * calorimeter is 10.20 kJ/°C; students find that number by calibration, never from the screen.
 */
export const BOMB_HARDWARE_HEAT_CAPACITY = 1832;

/** Bomb-to-water conductance (W/°C): the water settles about 40 s after ignition. */
export const BOMB_WATER_CONDUCTANCE = 46;

/** Water-to-room conductance through a real jacket (W/°C). */
export const JACKET_CONDUCTANCE = 1;

/** Time constant of the combustion itself (s). */
export const BURN_TIME_CONSTANT = 1.5;

/** Starting temperature of the bucket water, also the room's on this screen (°C). */
export const BOMB_START_TEMPERATURE = 25;

/** Mass of sample burned (g). */
export const PELLET_MASS_RANGE = new Range(0.5, 1.5);
export const PELLET_MASS_DEFAULT = 1;

/** The calorimeter heat capacity the student enters (kJ/°C). */
export const CALORIMETER_CONSTANT_RANGE = new Range(5, 15);
export const CALORIMETER_CONSTANT_DEFAULT = 10;

/** Simulated seconds per real second at slow / normal / fast speed. */
export const BOMB_TIME_SCALE: TimeScale = { slow: 2, normal: 10, fast: 40 };

// ── Temperature records ───────────────────────────────────────────────────────

/** Simulated seconds between recorded temperature samples. */
export const RECORD_INTERVAL = 0.5;

/** A record keeps at most this many samples; later samples are thinned. */
export const RECORD_CAPACITY = 2400;

/**
 * The extrapolation fits a line to the drift after the temperature peak once this much time
 * (s) has passed since the peak.
 */
export const EXTRAPOLATION_MIN_DRIFT_TIME = 30;

CalorimetryLabNamespace.register("CalorimetryLabConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  PANEL_SPACING,
  SIDE_COLUMN_WIDTH,
  GAS_CONSTANT,
  WATER_SPECIFIC_HEAT,
  BOMB_HARDWARE_HEAT_CAPACITY,
});
