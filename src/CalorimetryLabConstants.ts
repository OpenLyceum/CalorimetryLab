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
 * The extrapolation fits a line to a fixed window of the drift (s long) that opens once the heat
 * has all arrived. A window fixed in time keeps the result from creeping as the calorimeter
 * follows its exponential approach to room temperature. It closes well before the record first
 * thins (RECORD_CAPACITY × RECORD_INTERVAL = 1200 s).
 */
export const EXTRAPOLATION_FIT_DURATION = 30;

/**
 * Coffee cup: the drift window opens this many reaction time constants after mixing (27 s for
 * neutralization, 135 s for magnesium). The reaction is then 99.99 % complete, so its last heat
 * tilts the line by under 0.1 % of ΔT; an earlier window shows that tilt even in an ideal cup,
 * and a later one has more of the exponential drift to extrapolate back over in a leaky cup.
 */
export const DRIFT_START_TIME_CONSTANTS = 9;

/**
 * Bomb: the drift window opens this long after ignition (s). Heat spreads from the bomb into the
 * water with a time constant of 1 / (G (1/C_bomb + 1/C_water)) ≈ 33 s. After 400 s (12 time
 * constants) the water's last approach tilts the fitted line by less than 0.01 % of ΔT; at 300 s
 * it would still be 0.05 %. Until then the water is still rising and no calibration is valid.
 */
export const BOMB_DRIFT_START_TIME = 400;

/**
 * Coffee cup: temperatures a trial may reach (°C). The model keeps the solution liquid and has no
 * evaporation. Above 60 °C the water vapour that escaping hydrogen carries off (saturated at
 * 20 kPa) takes more than 2 % of the heat of Mg + HCl, and a foam cup of hot solution is no
 * longer safe to handle.
 */
export const SOLUTION_TEMPERATURE_RANGE = new Range(0, 60);

/** Settings for bomb/view/BombApparatusNode.ts. */
export const BOMB_APPARATUS_NODE_SETTINGS = {
  CONSTRUCTOR_Y_OFFSET: 18, // px
  CONSTRUCTOR_CENTER_X_OFFSET: 26, // px
  CONSTRUCTOR_BOTTOM_OFFSET: 10, // px

  FLASH_RADIUS_SEGMENT_2: 12, // px
  WIRES_X_SEGMENT_2: 14, // px

  /** Jacket left (px). */
  JACKET_LEFT: 40,
  /** Jacket top (px). */
  JACKET_TOP: 100,
  /** Jacket width (px). */
  JACKET_WIDTH: 270,
  /** Jacket height (px). */
  JACKET_HEIGHT: 170,
  /** Wall (px). */
  WALL: 14,
  /** Bomb left (px). */
  BOMB_LEFT: 125,
  /** Bomb top (px). */
  BOMB_TOP: 150,
  /** Bomb width (px). */
  BOMB_WIDTH: 80,
  /** Bomb height (px). */
  BOMB_HEIGHT: 100,
  /** Jacket corner x (px). */
  JACKET_CORNER_X: 8,
  /** Jacket corner y (px). */
  JACKET_CORNER_Y: 8,
  /** Lid height (px). */
  LID_HEIGHT: 12,
  /** Lid corner x (px). */
  LID_CORNER_X: 3,
  /** Lid corner y (px). */
  LID_CORNER_Y: 3,
  /** Bucket outline line width (px). */
  BUCKET_OUTLINE_LINE_WIDTH: 2,
  /** Bomb body corner x (px). */
  BOMB_BODY_CORNER_X: 10,
  /** Bomb body corner y (px). */
  BOMB_BODY_CORNER_Y: 10,
  /** Bomb body line width (px). */
  BOMB_BODY_LINE_WIDTH: 2,
  /** Bomb inside corner x (px). */
  BOMB_INSIDE_CORNER_X: 6,
  /** Bomb inside corner y (px). */
  BOMB_INSIDE_CORNER_Y: 6,
  /** Bomb cap height (px). */
  BOMB_CAP_HEIGHT: 16,
  /** Bomb cap corner x (px). */
  BOMB_CAP_CORNER_X: 4,
  /** Bomb cap corner y (px). */
  BOMB_CAP_CORNER_Y: 4,
  /** Pellet width (px). */
  PELLET_WIDTH: 16,
  /** Pellet height (px). */
  PELLET_HEIGHT: 10,
  /** Pellet corner x (px). */
  PELLET_CORNER_X: 2,
  /** Pellet corner y (px). */
  PELLET_CORNER_Y: 2,
  /** Fuse wire line width (px). */
  FUSE_WIRE_LINE_WIDTH: 1.5,
  /** Flash radius (px). */
  FLASH_RADIUS: 24,
  /** Flash opacity (dimensionless). */
  FLASH_OPACITY: 0.35,
  /** Ignition unit width (px). */
  IGNITION_UNIT_WIDTH: 44,
  /** Ignition unit height (px). */
  IGNITION_UNIT_HEIGHT: 30,
  /** Ignition unit corner x (px). */
  IGNITION_UNIT_CORNER_X: 4,
  /** Ignition unit corner y (px). */
  IGNITION_UNIT_CORNER_Y: 4,
  /** Ignition light radius (px). */
  IGNITION_LIGHT_RADIUS: 4,
  /** Ignition light x (px). */
  IGNITION_LIGHT_X: 22,
  /** Ignition light y (px). */
  IGNITION_LIGHT_Y: 15,
  /** Wires x (px). */
  WIRES_X: 30,
  /** Wires y (px). */
  WIRES_Y: 30,
  /** Wires line width (px). */
  WIRES_LINE_WIDTH: 2,
  /** Stirrer shaft width (px). */
  STIRRER_SHAFT_WIDTH: 3,
  /** Stirrer blade radius x (px). */
  STIRRER_BLADE_RADIUS_X: 14,
  /** Stirrer blade radius y (px). */
  STIRRER_BLADE_RADIUS_Y: 4,
} as const;

/** Settings for bomb/view/BombCalorimeterScreenView.ts. */
export const BOMB_CALORIMETER_SCREEN_VIEW_SETTINGS = {
  CONSTRUCTOR_TOP_OFFSET: 16, // px
  SIDE_COLUMN_SPACING_OFFSET: 4, // px

  DELTA_T_LINE_DECIMALS: 3, // digits
  MASS_FIXED_DECIMALS: 3, // digits
  FIXED_DECIMALS: 3, // digits
  FIXED_DECIMALS_SEGMENT_2: 2, // digits
  CALCULATION_HEADING_HEADING_MAX_WIDTH: 200, // px
  USE_CALIBRATION_BUTTON_DECIMALS: 2, // digits
  VALUE_FIXED_DECIMALS: 3, // digits

  /** Left column width (px). */
  LEFT_COLUMN_WIDTH: 318,
  /** Chart left (px). */
  CHART_LEFT: 404,
  /** Chart top (px). */
  CHART_TOP: 44,
  /** Chart width (px). */
  CHART_WIDTH: 344,
  /** Chart height (px). */
  CHART_HEIGHT: 180,
  /** Calculation left (px). */
  CALCULATION_LEFT: 350,
  /** Calculation width (px). */
  CALCULATION_WIDTH: 404,
  /** Mass control delta (control/model units). */
  MASS_CONTROL_DELTA: 0.005,
  /** Mass control decimal places (digits). */
  MASS_CONTROL_DECIMAL_PLACES: 3,
  /** Sample panel spacing (px). */
  SAMPLE_PANEL_SPACING: 8,
  /** Calculation panel spacing (px). */
  CALCULATION_PANEL_SPACING: 6,
  /** Constant control delta (control/model units). */
  CONSTANT_CONTROL_DELTA: 0.01,
  /** Constant control decimal places (digits). */
  CONSTANT_CONTROL_DECIMAL_PLACES: 2,
  /** Mode panel spacing (px). */
  MODE_PANEL_SPACING: 8,
  /** Trial panel spacing (px). */
  TRIAL_PANEL_SPACING: 8,
} as const;

/** Settings for coffee-cup/view/CoffeeCupApparatusNode.ts. */
export const COFFEE_CUP_APPARATUS_NODE_SETTINGS = {
  CONSTRUCTOR_X_FACTOR: 0.35, // dimensionless
  CONSTRUCTOR_CENTER_X_FACTOR: 0.7, // dimensionless
  CONSTRUCTOR_BOTTOM_OFFSET: 16, // px
  BOAT_X_OFFSET: 5, // px
  BOAT_Y_OFFSET: 14, // px
  CONSTRUCTOR_X_OFFSET: 15, // px
  CONSTRUCTOR_Y_OFFSET: 20, // px
  CONSTRUCTOR_Y_FACTOR: 53, // dimensionless
  LAYOUT_CENTER_X_OFFSET: 45, // px
  LAYOUT_BOTTOM_OFFSET: 14, // px
  LAYOUT_CENTER_X_FACTOR: 0.45, // dimensionless
  LAYOUT_TOP_OFFSET: 18, // px
  CONSTRUCTOR_LAYOUT_TOP_OFFSET: 8, // px
  STEP_Y_OFFSET: 6, // px
  STEP_Y_FACTOR: 6, // dimensionless

  BOAT_X_SEGMENT_2: 85, // px
  BOAT_X_SEGMENT_3: 15, // px

  /** Cup left (px). */
  CUP_LEFT: 150,
  /** Cup top (px). */
  CUP_TOP: 110,
  /** Cup width (px). */
  CUP_WIDTH: 140,
  /** Cup height (px). */
  CUP_HEIGHT: 140,
  /** Volume that fills the cup to the brim (mL). */
  CUP_CAPACITY: 230,
  /** Beaker left (px). */
  BEAKER_LEFT: 10,
  /** Beaker top (px). */
  BEAKER_TOP: 160,
  /** Beaker width (px). */
  BEAKER_WIDTH: 90,
  /** Beaker height (px). */
  BEAKER_HEIGHT: 90,
  /** Volume that fills the beaker (mL). */
  BEAKER_CAPACITY: 120,
  /** Bubble count (count). */
  BUBBLE_COUNT: 10,
  /** Bubble speed (px). */
  BUBBLE_SPEED: 45,
  /** Formula options max width (px). */
  FORMULA_OPTIONS_MAX_WIDTH: 130,
  /** Stirrer x (px). */
  STIRRER_X: -1.5,
  /** Stirrer y (px). */
  STIRRER_Y: -40,
  /** Stirrer width (px). */
  STIRRER_WIDTH: 3,
  /** Stirrer radius x (px). */
  STIRRER_RADIUS_X: 18,
  /** Stirrer radius y (px). */
  STIRRER_RADIUS_Y: 5,
  /** Stirrer line width (px). */
  STIRRER_LINE_WIDTH: 3,
  /** Beaker liquid height (px). */
  BEAKER_LIQUID_HEIGHT: 10,
  /** Beaker line width (px). */
  BEAKER_LINE_WIDTH: 2.5,
  /** Boat x (px). */
  BOAT_X: 100,
  /** Boat y (px). */
  BOAT_Y: 14,
  /** Ribbon width (px). */
  RIBBON_WIDTH: 60,
  /** Ribbon height (px). */
  RIBBON_HEIGHT: 5,
  /** Ribbon in cup width (px). */
  RIBBON_IN_CUP_WIDTH: 50,
  /** Ribbon in cup height (px). */
  RIBBON_IN_CUP_HEIGHT: 5,
} as const;

/** Settings for coffee-cup/view/CoffeeCupScreenView.ts. */
export const COFFEE_CUP_SCREEN_VIEW_SETTINGS = {
  CONSTRUCTOR_LEFT_OFFSET: 10, // px
  CONSTRUCTOR_TOP_OFFSET: 14, // px
  SIDE_COLUMN_SPACING_OFFSET: 4, // px

  TEXTS_DECIMALS: 2, // digits
  CALCULATION_HEADING_HEADING_MAX_WIDTH: 200, // px
  FIXED_DECIMALS: 2, // digits

  /** Left column width (px). */
  LEFT_COLUMN_WIDTH: 318,
  /** Chart left (px). */
  CHART_LEFT: 404,
  /** Chart top (px). */
  CHART_TOP: 44,
  /** Chart width (px). */
  CHART_WIDTH: 344,
  /** Chart height (px). */
  CHART_HEIGHT: 180,
  /** Calculation left (px). */
  CALCULATION_LEFT: 350,
  /** Calculation width (px). */
  CALCULATION_WIDTH: 404,
  /** Amounts panel spacing (px). */
  AMOUNTS_PANEL_SPACING: 8,
  /** Calculation panel spacing (px). */
  CALCULATION_PANEL_SPACING: 6,
  /** Temperature control delta (control/model units). */
  TEMPERATURE_CONTROL_DELTA: 0.5,
  /** Reaction panel spacing (px). */
  REACTION_PANEL_SPACING: 8,
  /** Trial panel spacing (px). */
  TRIAL_PANEL_SPACING: 8,
} as const;

/** Settings for common/CalorimetryLabControlOptions.ts. */
export const CALORIMETRY_LAB_CONTROL_OPTIONS_SETTINGS = {
  /** Slider thumb size width (px). */
  SLIDER_THUMB_SIZE_WIDTH: 12,
  /** Slider thumb size height (px). */
  SLIDER_THUMB_SIZE_HEIGHT: 22,
  /** Standalone slider track size width (px). */
  STANDALONE_SLIDER_TRACK_SIZE_WIDTH: 150,
  /** Standalone slider track size height (px). */
  STANDALONE_SLIDER_TRACK_SIZE_HEIGHT: 3,
  /** Number control slider track size width (px). */
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_WIDTH: 110,
  /** Number control slider track size height (px). */
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_HEIGHT: 3,
  /** Checkbox box width (px). */
  CHECKBOX_BOX_WIDTH: 16,
  /** Calorimetry lab number control options scale (dimensionless). */
  CALORIMETRY_LAB_NUMBER_CONTROL_OPTIONS_SCALE: 0.75,
  /** Calorimetry lab number control options slider padding (px). */
  CALORIMETRY_LAB_NUMBER_CONTROL_OPTIONS_SLIDER_PADDING: 4,
  /** Calorimetry lab number control options arrow button spacing (px). */
  CALORIMETRY_LAB_NUMBER_CONTROL_OPTIONS_ARROW_BUTTON_SPACING: 3,
  /** Calorimetry lab number control options vertical spacing (px). */
  CALORIMETRY_LAB_NUMBER_CONTROL_OPTIONS_VERTICAL_SPACING: 4,
  /** Calorimetry lab checkbox options spacing (px). */
  CALORIMETRY_LAB_CHECKBOX_OPTIONS_SPACING: 4,
} as const;

/** Settings for common/CalorimetryLabPanel.ts. */
export const CALORIMETRY_LAB_PANEL_SETTINGS = {
  /** Options x margin (px). */
  OPTIONS_X_MARGIN: 12,
  /** Options y margin (px). */
  OPTIONS_Y_MARGIN: 10,
} as const;

/** Settings for common/CalorimetryLabScreenIcons.ts. */
export const CALORIMETRY_LAB_SCREEN_ICONS_SETTINGS = {
  THERMOMETER_WIDTH_SEGMENT_2: 8, // px
  THERMOMETER_RADIUS: 16, // px
  CREATE_SPECIFIC_HEAT_ICON_WIDTH: 330, // px
  CREATE_SPECIFIC_HEAT_ICON_HEIGHT: 250, // px
  CREATE_COFFEE_CUP_ICON_WIDTH_SEGMENT_2: 300, // px
  CREATE_COFFEE_CUP_ICON_HEIGHT_SEGMENT_2: 250, // px
  CREATE_COFFEE_CUP_ICON_X_SEGMENT_2: 220, // px
  CREATE_COFFEE_CUP_ICON_Y_SEGMENT_2: 20, // px
  CREATE_COFFEE_CUP_ICON_WIDTH_SEGMENT_3: 8, // px
  CREATE_COFFEE_CUP_ICON_HEIGHT_SEGMENT_3: 290, // px
  CREATE_BOMB_CALORIMETER_ICON_X_SEGMENT_2: 95, // px
  CREATE_BOMB_CALORIMETER_ICON_Y_SEGMENT_2: 110, // px
  CREATE_BOMB_CALORIMETER_ICON_WIDTH_SEGMENT_2: 360, // px
  CREATE_BOMB_CALORIMETER_ICON_HEIGHT_SEGMENT_2: 215, // px
  CREATE_BOMB_CALORIMETER_ICON_X_SEGMENT_3: 205, // px
  CREATE_BOMB_CALORIMETER_ICON_Y_SEGMENT_3: 140, // px
  CREATE_BOMB_CALORIMETER_ICON_WIDTH_SEGMENT_3: 140, // px
  CREATE_BOMB_CALORIMETER_ICON_HEIGHT_SEGMENT_3: 160, // px
  CREATE_BOMB_CALORIMETER_ICON_CORNER_X_SEGMENT_2: 18, // px
  CREATE_BOMB_CALORIMETER_ICON_CORNER_Y_SEGMENT_2: 18, // px
  CREATE_BOMB_CALORIMETER_ICON_X_SEGMENT_4: 195, // px
  CREATE_BOMB_CALORIMETER_ICON_Y_SEGMENT_4: 122, // px
  CREATE_BOMB_CALORIMETER_ICON_WIDTH_SEGMENT_4: 160, // px
  CREATE_BOMB_CALORIMETER_ICON_HEIGHT_SEGMENT_4: 30, // px
  CREATE_BOMB_CALORIMETER_ICON_CORNER_X_SEGMENT_3: 6, // px
  CREATE_BOMB_CALORIMETER_ICON_CORNER_Y_SEGMENT_3: 6, // px
  CREATE_BOMB_CALORIMETER_ICON_X_SEGMENT_5: 275, // px
  CREATE_BOMB_CALORIMETER_ICON_Y_SEGMENT_5: 240, // px
  CREATE_BOMB_CALORIMETER_ICON_RADIUS: 34, // px
  CREATE_BOMB_CALORIMETER_ICON_X_SEGMENT_6: 240, // px
  CREATE_BOMB_CALORIMETER_ICON_Y_SEGMENT_6: 122, // px
  CREATE_BOMB_CALORIMETER_ICON_Y_SEGMENT_7: 30, // px
  CREATE_BOMB_CALORIMETER_ICON_X_SEGMENT_7: 310, // px
  CREATE_BOMB_CALORIMETER_ICON_Y_SEGMENT_8: 122, // px
  CREATE_BOMB_CALORIMETER_ICON_Y_SEGMENT_9: 30, // px
  CREATE_BOMB_CALORIMETER_ICON_ITEM_7_LINE_WIDTH: 7, // px

  /** Cup line width (px). */
  CUP_LINE_WIDTH: 6,
  /** Thermometer width (px). */
  THERMOMETER_WIDTH: 18,
  /** Thermometer corner x (px). */
  THERMOMETER_CORNER_X: 9,
  /** Thermometer corner y (px). */
  THERMOMETER_CORNER_Y: 9,
  /** Thermometer line width (px). */
  THERMOMETER_LINE_WIDTH: 3,
  /** Heat arrow head width (px). */
  HEAT_ARROW_HEAD_WIDTH: 34,
  /** Heat arrow head height (px). */
  HEAT_ARROW_HEAD_HEIGHT: 26,
  /** Heat arrow tail width (px). */
  HEAT_ARROW_TAIL_WIDTH: 12,
  /** Block x (px). */
  BLOCK_X: 210,
  /** Block y (px). */
  BLOCK_Y: 190,
  /** Block width (px). */
  BLOCK_WIDTH: 90,
  /** Block height (px). */
  BLOCK_HEIGHT: 90,
  /** Block corner x (px). */
  BLOCK_CORNER_X: 6,
  /** Block corner y (px). */
  BLOCK_CORNER_Y: 6,
  /** Block line width (px). */
  BLOCK_LINE_WIDTH: 3,
  /** Create coffee cup icon x (px). */
  CREATE_COFFEE_CUP_ICON_X: 100,
  /** Create coffee cup icon y (px). */
  CREATE_COFFEE_CUP_ICON_Y: 70,
  /** Create coffee cup icon width (px). */
  CREATE_COFFEE_CUP_ICON_WIDTH: 340,
  /** Create coffee cup icon height (px). */
  CREATE_COFFEE_CUP_ICON_HEIGHT: 26,
  /** Create coffee cup icon corner x (px). */
  CREATE_COFFEE_CUP_ICON_CORNER_X: 8,
  /** Create coffee cup icon corner y (px). */
  CREATE_COFFEE_CUP_ICON_CORNER_Y: 8,
  /** Create coffee cup icon line width (px). */
  CREATE_COFFEE_CUP_ICON_LINE_WIDTH: 6,
  /** Create bomb calorimeter icon x (px). */
  CREATE_BOMB_CALORIMETER_ICON_X: 70,
  /** Create bomb calorimeter icon y (px). */
  CREATE_BOMB_CALORIMETER_ICON_Y: 70,
  /** Create bomb calorimeter icon width (px). */
  CREATE_BOMB_CALORIMETER_ICON_WIDTH: 410,
  /** Create bomb calorimeter icon height (px). */
  CREATE_BOMB_CALORIMETER_ICON_HEIGHT: 280,
  /** Create bomb calorimeter icon corner x (px). */
  CREATE_BOMB_CALORIMETER_ICON_CORNER_X: 16,
  /** Create bomb calorimeter icon corner y (px). */
  CREATE_BOMB_CALORIMETER_ICON_CORNER_Y: 16,
  /** Create bomb calorimeter icon line width (px). */
  CREATE_BOMB_CALORIMETER_ICON_LINE_WIDTH: 5,
  /** Level width (px). */
  LEVEL_WIDTH: 100,
  /** Level height (px). */
  LEVEL_HEIGHT: 8,
  /** Arrow head width (px). */
  ARROW_HEAD_WIDTH: 40,
  /** Arrow head height (px). */
  ARROW_HEAD_HEIGHT: 34,
  /** Arrow tail width (px). */
  ARROW_TAIL_WIDTH: 14,
} as const;

/** Settings for common/model/extrapolation.ts. */
export const EXTRAPOLATION_SETTINGS = {
  /** Minimum number of points for a drift-line fit (count). */
  MIN_FIT_POINTS: 3,
  /** Record times accumulate frame steps, so window edges allow for round-off (s). */
  TIME_TOLERANCE: 1e-6,
} as const;

/** Settings for common/view/ControlFactory.ts. */
export const CONTROL_FACTORY_SETTINGS = {
  ITEMS_MAX_WIDTH_OFFSET: 40, // px
  RADIO_GROUP_SPACING: 4, // px
  NUMBER_CONTROL_MAX_WIDTH_OFFSET: 70, // px

  /** Control font size (px). */
  CONTROL_FONT_SIZE: 13,
  /** Small font size (px). */
  SMALL_FONT_SIZE: 12,
  /** Heading font size (px). */
  HEADING_FONT_SIZE: 14,
  /** Combo box x margin (px). */
  COMBO_BOX_X_MARGIN: 8,
  /** Combo box y margin (px). */
  COMBO_BOX_Y_MARGIN: 3,
  /** Combo box corner radius (px). */
  COMBO_BOX_CORNER_RADIUS: 4,
  /** Push button x margin (px). */
  PUSH_BUTTON_X_MARGIN: 8,
  /** Push button y margin (px). */
  PUSH_BUTTON_Y_MARGIN: 4,
  /** Radio group radius (px). */
  RADIO_GROUP_RADIUS: 6,
} as const;

/** Settings for common/view/FoamCupNode.ts. */
export const FOAM_CUP_NODE_SETTINGS = {
  /** Wall (px). */
  WALL: 6,
  /** Bottom ratio (px). */
  BOTTOM_RATIO: 0.72,
  /** Constructor x (px). */
  CONSTRUCTOR_X: -8,
  /** Constructor y (px). */
  CONSTRUCTOR_Y: -10,
  /** Constructor height (px). */
  CONSTRUCTOR_HEIGHT: 10,
  /** Constructor corner x (px). */
  CONSTRUCTOR_CORNER_X: 3,
  /** Constructor corner y (px). */
  CONSTRUCTOR_CORNER_Y: 3,
} as const;

/** Settings for common/view/RichTextLines.ts. */
export const RICH_TEXT_LINES_SETTINGS = {
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 4,
} as const;

/** Settings for common/view/TemperatureChartNode.ts. */
export const TEMPERATURE_CHART_NODE_SETTINGS = {
  EXTRAPOLATION_LINE_LINE_DASH_DASH: 5, // px
  CONSTRUCTOR_EXTRAPOLATION_LINE_LINE_DASH_DASH: 4, // px
  CONSTRUCTOR_TOP_OFFSET: 18, // px
  LEGEND_ENTRY_LINE_DASH_DASH: 4, // px
  CONSTRUCTOR_LEGEND_ENTRY_LINE_DASH_DASH: 3, // px

  /** Chart transform range max (control/model units). */
  CHART_TRANSFORM_RANGE_MAX: 100,
  /** Plots line width (px). */
  PLOTS_LINE_WIDTH: 2,
  /** Dots radius (px). */
  DOTS_RADIUS: 4,
  /** Extrapolation line line width (px). */
  EXTRAPOLATION_LINE_LINE_WIDTH: 1.5,
  /** Extrapolation point radius (px). */
  EXTRAPOLATION_POINT_RADIUS: 4.5,
  /** Extrapolation point line width (px). */
  EXTRAPOLATION_POINT_LINE_WIDTH: 2,
  /** Plot x (px). */
  PLOT_X: -6,
  /** Plot y (px). */
  PLOT_Y: -6,
  /** Right right (px). */
  RIGHT_RIGHT: -36,
  /** Bottom bottom (px). */
  BOTTOM_BOTTOM: -8,
  /** Legend entry spacing (px). */
  LEGEND_ENTRY_SPACING: 4,
  /** Legend entry end x (px). */
  LEGEND_ENTRY_END_X: 16,
  /** Legend entry line width (px). */
  LEGEND_ENTRY_LINE_WIDTH: 2,
  /** Legend entry max width (px). */
  LEGEND_ENTRY_MAX_WIDTH: 80,
  /** Legend spacing (px). */
  LEGEND_SPACING: 10,
} as const;

/** Settings for common/view/ThermometerReadoutNode.ts. */
export const THERMOMETER_READOUT_NODE_SETTINGS = {
  CONSTRUCTOR_BOTTOM_OFFSET: 4, // px

  /** Thermometer line width (px). */
  THERMOMETER_LINE_WIDTH: 1.5,
  /** Text max width (px). */
  TEXT_MAX_WIDTH: 90,
  /** Background width (px). */
  BACKGROUND_WIDTH: 80,
  /** Background height (px). */
  BACKGROUND_HEIGHT: 20,
  /** Background corner x (px). */
  BACKGROUND_CORNER_X: 4,
  /** Background corner y (px). */
  BACKGROUND_CORNER_Y: 4,
  /** Label max width (px). */
  LABEL_MAX_WIDTH: 90,
} as const;

/** Settings for hess-law/model/HessLawModel.ts. */
export const HESS_LAW_MODEL_SETTINGS = {
  /** Max steps (count). */
  MAX_STEPS: 3,
} as const;

/** Settings for hess-law/model/ReactionEquation.ts. */
export const REACTION_EQUATION_SETTINGS = {
  /** Absolute tolerance when matching or formatting stoichiometric coefficients (dimensionless). */
  COEFFICIENT_MATCH_TOLERANCE: 1e-6,
  /** Coefficients smaller than this count as zero (species cancelled). */
  TOLERANCE: 1e-9,
} as const;

/** Settings for hess-law/model/grossSum.ts. */
export const GROSS_SUM_SETTINGS = {
  /** Amounts smaller than this count as zero. */
  TOLERANCE: 1e-9,
} as const;

/** Settings for hess-law/view/EnthalpyDiagramNode.ts. */
export const ENTHALPY_DIAGRAM_NODE_SETTINGS = {
  DRAW_BOTTOM_OFFSET: 3, // px
  DRAW_LINE_DASH_DASH: 3, // px
  TEXT_MAX_WIDTH_FACTOR: 0.8, // dimensionless
  DRAW_LEFT_OFFSET: 6, // px

  /** Min span (px). */
  MIN_SPAN: 60,
  /** Level width (px). */
  LEVEL_WIDTH: 46,
  /** Right right (px). */
  RIGHT_RIGHT: -4,
  /** Draw line width (px). */
  DRAW_LINE_WIDTH: 2,
  /** Draw head width (px). */
  DRAW_HEAD_WIDTH: 10,
  /** Draw tail width (px). */
  DRAW_TAIL_WIDTH: 3,
} as const;

/** Settings for hess-law/view/HessLawScreenView.ts. */
export const HESS_LAW_SCREEN_VIEW_SETTINGS = {
  TARGET_TEXT_MAX_WIDTH_OFFSET: 140, // px
  FORMATION_TEXT_LINE_WRAP_OFFSET: 24, // px

  /** Left width (px). */
  LEFT_WIDTH: 590,
  /** Right width (px). */
  RIGHT_WIDTH: 374,
  /** Diagram width (px). */
  DIAGRAM_WIDTH: 330,
  /** Diagram height (px). */
  DIAGRAM_HEIGHT: 270,
  /** Target enthalpy max width (px). */
  TARGET_ENTHALPY_MAX_WIDTH: 130,
  /** Sum panel spacing (px). */
  SUM_PANEL_SPACING: 6,
  /** Puzzle panel spacing (px). */
  PUZZLE_PANEL_SPACING: 8,
  /** Diagram panel spacing (px). */
  DIAGRAM_PANEL_SPACING: 10,
  /** X x (px). */
  X_X: 34,
} as const;

/** Settings for hess-law/view/StepCardNode.ts. */
export const STEP_CARD_NODE_SETTINGS = {
  EQUATION_MAX_WIDTH_OFFSET: 40, // px
  LAYOUT_TOP_ROW_LEFT_OFFSET: 12, // px

  REVERSED_CHECKBOX_MAX_WIDTH: 120, // px
  FACTOR_RADIO_GROUP_MAX_WIDTH: 60, // px
  ITEM_2_SPACING: 24, // px

  /** Title width (px). */
  TITLE_WIDTH: 64,
  /** Enthalpy width (px). */
  ENTHALPY_WIDTH: 120,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 8,
} as const;

/** Settings for preferences/CalorimetryLabPreferencesNode.ts. */
export const CALORIMETRY_LAB_PREFERENCES_NODE_SETTINGS = {
  /** Header font size (px). */
  HEADER_FONT_SIZE: 18,
  /** Show calculations checkbox font size (px). */
  SHOW_CALCULATIONS_CHECKBOX_FONT_SIZE: 14,
  /** Show calculations checkbox max width (px). */
  SHOW_CALCULATIONS_CHECKBOX_MAX_WIDTH: 560,
  /** Show calculations checkbox spacing (px). */
  SHOW_CALCULATIONS_CHECKBOX_SPACING: 8,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 12,
} as const;

/** Settings for specific-heat/view/SpecificHeatApparatusNode.ts. */
export const SPECIFIC_HEAT_APPARATUS_NODE_SETTINGS = {
  BATH_LABEL_MAX_WIDTH_OFFSET: 30, // px
  CONSTRUCTOR_TOP_OFFSET: 22, // px
  CONSTRUCTOR_CENTER_X_FACTOR: 0.78, // dimensionless
  CONSTRUCTOR_BOTTOM_OFFSET: 18, // px
  CUP_LABEL_MAX_WIDTH_OFFSET: 20, // px

  HOT_PLATE_HEIGHT_SEGMENT_2: 4, // px
  DIRECTIONS_X_SEGMENT_2: 0.7, // px

  /** Pixels per centimetre for the sample block. */
  BLOCK_SCALE: 11,
  /** Bath top (px). */
  BATH_TOP: 120,
  /** Bath width (px). */
  BATH_WIDTH: 120,
  /** Bath height (px). */
  BATH_HEIGHT: 130,
  /** Cup left (px). */
  CUP_LEFT: 170,
  /** Cup top (px). */
  CUP_TOP: 120,
  /** Cup width (px). */
  CUP_WIDTH: 140,
  /** Cup height (px). */
  CUP_HEIGHT: 150,
  /** Drop duration (px). */
  DROP_DURATION: 0.6,
  /** Hot plate height (px). */
  HOT_PLATE_HEIGHT: 18,
  /** Hot plate corner x (px). */
  HOT_PLATE_CORNER_X: 3,
  /** Hot plate corner y (px). */
  HOT_PLATE_CORNER_Y: 3,
  /** Bath glass line width (px). */
  BATH_GLASS_LINE_WIDTH: 2.5,
  /** Block width (px). */
  BLOCK_WIDTH: 10,
  /** Block height (px). */
  BLOCK_HEIGHT: 10,
  /** Block corner x (px). */
  BLOCK_CORNER_X: 2,
  /** Block corner y (px). */
  BLOCK_CORNER_Y: 2,
  /** String y (px). */
  STRING_Y: -70,
  /** Tag background width (px). */
  TAG_BACKGROUND_WIDTH: 58,
  /** Tag background height (px). */
  TAG_BACKGROUND_HEIGHT: 16,
  /** Tag background corner x (px). */
  TAG_BACKGROUND_CORNER_X: 3,
  /** Tag background corner y (px). */
  TAG_BACKGROUND_CORNER_Y: 3,
  /** Arrows end x (px). */
  ARROWS_END_X: 10,
  /** Arrows head width (px). */
  ARROWS_HEAD_WIDTH: 9,
  /** Arrows head height (px). */
  ARROWS_HEAD_HEIGHT: 7,
  /** Arrows tail width (px). */
  ARROWS_TAIL_WIDTH: 3,
  /** Directions x (px). */
  DIRECTIONS_X: -0.7,
  /** Directions y (px). */
  DIRECTIONS_Y: -0.7,
} as const;

/** Settings for specific-heat/view/SpecificHeatScreenView.ts. */
export const SPECIFIC_HEAT_SCREEN_VIEW_SETTINGS = {
  CONSTRUCTOR_LEFT_OFFSET: 10, // px
  CONSTRUCTOR_TOP_OFFSET: 16, // px
  SIDE_COLUMN_SPACING_OFFSET: 4, // px

  WATER_LINE_DECIMALS: 2, // digits
  FIXED_DECIMALS: 2, // digits
  FIXED_DECIMALS_SEGMENT_2: 3, // digits
  SPECIFIC_HEAT_FIXED_DECIMALS: 3, // digits
  CALCULATION_HEADING_HEADING_MAX_WIDTH: 200, // px

  /** Left column width (px). */
  LEFT_COLUMN_WIDTH: 318,
  /** Chart left (px). */
  CHART_LEFT: 404,
  /** Chart top (px). */
  CHART_TOP: 44,
  /** Chart width (px). */
  CHART_WIDTH: 344,
  /** Chart height (px). */
  CHART_HEIGHT: 190,
  /** Calculation left (px). */
  CALCULATION_LEFT: 350,
  /** Calculation width (px). */
  CALCULATION_WIDTH: 404,
  /** Water temperature control delta (control/model units). */
  WATER_TEMPERATURE_CONTROL_DELTA: 0.5,
  /** Water panel spacing (px). */
  WATER_PANEL_SPACING: 8,
  /** Calculation panel spacing (px). */
  CALCULATION_PANEL_SPACING: 6,
  /** Sample panel spacing (px). */
  SAMPLE_PANEL_SPACING: 8,
  /** Trial panel spacing (px). */
  TRIAL_PANEL_SPACING: 8,
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const SPECIFIC_HEAT_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  CURRENT_DETAILS_PROPERTY_DECIMALS: 2, // digits
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const FORMAT_VALUES_SETTINGS = {
  FORMAT_KILOJOULES_DECIMALS: 3, // digits
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const COFFEE_CUP_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  CURRENT_DETAILS_PROPERTY_DECIMALS: 2, // digits
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const BOMB_CALORIMETER_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  CURRENT_DETAILS_PROPERTY_DECIMALS: 3, // digits
} as const;

/** Settings for common/model/ThermalNetwork.ts; units are documented per value. */
export const THERMAL_NETWORK_NUMERICS = {
  /** Largest integration step as a fraction of the fastest thermal time constant (dimensionless). */
  MAX_TIME_CONSTANT_FRACTION: 0.1,
} as const;

/** Settings for common/model/TemperatureRecord.ts; units are documented per value. */
export const TEMPERATURE_RECORD_NUMERICS = {
  /** Tolerance for reaching a record boundary (s). */
  SAMPLE_TIME_TOLERANCE: 1e-9,
} as const;

CalorimetryLabNamespace.register("CalorimetryLabConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  PANEL_SPACING,
  SIDE_COLUMN_WIDTH,
  GAS_CONSTANT,
  WATER_SPECIFIC_HEAT,
  BOMB_HARDWARE_HEAT_CAPACITY,
});
