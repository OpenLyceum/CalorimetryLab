/**
 * CalorimetryLabColors.ts
 *
 * Defines all dynamic colors for the simulation using ProfileColorProperty.
 *
 * Each color has two profiles:
 *   - "default"   — used in standard (dark) mode
 *   - "projector" — used when the user enables Projector Mode in Preferences
 *
 * SceneryStack switches profiles automatically; no manual toggling is needed.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 * Import CalorimetryLabColors and pass properties directly to Node's fillProperty or
 * strokeProperty options:
 *
 *   import CalorimetryLabColors from "../../CalorimetryLabColors.js";
 *
 *   new Rectangle( 0, 0, 100, 50, {
 *     fillProperty: CalorimetryLabColors.backgroundColorProperty,
 *   });
 *
 * ── How to add a color ────────────────────────────────────────────────────────
 * Add a new ProfileColorProperty entry to the CalorimetryLabColors object below.
 * Always provide both "default" and "projector" values.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import CalorimetryLabNamespace from "./CalorimetryLabNamespace.js";

const CalorimetryLabColors = {
  /**
   * Background color for the simulation screen.
   * Deep navy in default mode; white in projector mode.
   */
  backgroundColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  /**
   * Primary accent color for highlights, selected items, and key UI elements.
   * Sky blue in default mode; dark navy in projector mode.
   */
  accentColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /**
   * Background fill for control panels and dialogs.
   * Deep blue in default mode; light gray in projector mode.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Teal-navy in default mode; medium gray in projector mode.
   */
  panelBorderColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Near-white in default mode; near-black in projector mode.
   */
  textColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark. Same values in default and projector mode,
  // but defined here so every color lives in one themeable place.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "controlSurfaceDisabled", {
    default: "#cccccc",
    projector: "#cccccc",
  }),

  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),

  // ── Text, charts ──────────────────────────────────────────────────────────────

  /** Secondary text: units, captions, hints. */
  mutedTextColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "mutedText", {
    default: "#9aa4b8",
    projector: "#555555",
  }),

  /** Chart plotting area. */
  chartBackgroundColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "chartBackground", {
    default: "#10182e",
    projector: "#ffffff",
  }),

  /** Chart frame and tick marks. */
  chartAxisColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "chartAxis", {
    default: "#8a96b0",
    projector: "#333333",
  }),

  /** Chart grid lines. */
  chartGridColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "chartGrid", {
    default: "#26324f",
    projector: "#dddddd",
  }),

  /** Temperature trace of the water (or solution) in the calorimeter. */
  waterTraceColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "waterTrace", {
    default: "#4fc3f7",
    projector: "#0b5fa5",
  }),

  /** Temperature trace of the hot sample or of the bomb. */
  sampleTraceColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "sampleTrace", {
    default: "#ffb74d",
    projector: "#d35400",
  }),

  /** Dashed extrapolation line and the start-of-reaction marker. */
  extrapolationColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "extrapolation", {
    default: "#e0e0e0",
    projector: "#333333",
  }),

  /** A result that agrees with the accepted value; a solved puzzle. */
  goodColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "good", {
    default: "#81c784",
    projector: "#1b7d32",
  }),

  /** A result that disagrees; an unsolved puzzle. */
  poorColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "poor", {
    default: "#ff8a80",
    projector: "#c62828",
  }),

  /** Heat released (ΔH < 0): downward enthalpy arrows; the warming tint of the surroundings. */
  exothermicColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "exothermic", {
    default: "#ff8a65",
    projector: "#c0392b",
  }),

  /** Heat absorbed (ΔH > 0): upward enthalpy arrows; the cooling tint of the surroundings. */
  endothermicColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "endothermic", {
    default: "#64b5f6",
    projector: "#1f5fa8",
  }),

  /** Species that cancel when the Hess steps are added. */
  cancelledColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "cancelled", {
    default: "#6f7a92",
    projector: "#999999",
  }),

  /** The target reaction and its enthalpy arrow. */
  targetColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "target", {
    default: "#ffd54f",
    projector: "#b26a00",
  }),

  /** Enthalpy level lines on the Hess diagram. */
  levelLineColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "levelLine", {
    default: "#8a96b0",
    projector: "#777777",
  }),

  // ── Apparatus ─────────────────────────────────────────────────────────────────

  /** Glassware outlines. */
  glassColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "glass", {
    default: "#b8c7dc",
    projector: "#5a6a80",
  }),

  /** Water and dilute solutions. */
  waterColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "water", {
    default: "#2a4a6e",
    projector: "#d6ecfa",
  }),

  /** The boiling-water bath. */
  hotWaterColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "hotWater", {
    default: "#7a4a5e",
    projector: "#f8d7d0",
  }),

  /** Polystyrene foam cups and lid. */
  foamColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "foam", {
    default: "#e8e4da",
    projector: "#f2efe8",
  }),

  /** Foam cup outlines. */
  foamEdgeColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "foamEdge", {
    default: "#b0aa9c",
    projector: "#9a9486",
  }),

  /** Steel: the bomb, the stirrer, the clamp. */
  steelColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "steel", {
    default: "#9aa7b4",
    projector: "#8a96a3",
  }),

  /** Steel shading and outlines. */
  steelDarkColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "steelDark", {
    default: "#5f6b78",
    projector: "#56616c",
  }),

  /** The bomb calorimeter bucket and jacket. */
  bucketColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "bucket", {
    default: "#3b4660",
    projector: "#c9d2de",
  }),

  /** Hot plate under the boiling-water bath. */
  hotPlateColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "hotPlate", {
    default: "#555d6e",
    projector: "#7b8494",
  }),

  /** Glowing hot-plate element. */
  hotPlateGlowColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "hotPlateGlow", {
    default: "#ff7043",
    projector: "#e64a19",
  }),

  /** Combustion flash inside the bomb. */
  flameColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "flame", {
    default: "#ffcc80",
    projector: "#ff9800",
  }),

  /** Ignition wires. */
  wireColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "wire", {
    default: "#c9a227",
    projector: "#8a6d12",
  }),

  /** White crystalline solids and pellets. */
  solidColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "solid", {
    default: "#f2f2f2",
    projector: "#ffffff",
  }),

  /** Solid outlines. */
  solidEdgeColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "solidEdge", {
    default: "#9e9e9e",
    projector: "#757575",
  }),

  /** Thermometer fluid. */
  thermometerFluidColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "thermometerFluid", {
    default: "#e53935",
    projector: "#c62828",
  }),

  /** Thermometer fluid highlight. */
  thermometerHighlightColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "thermometerHighlight", {
    default: "#ff8a80",
    projector: "#ff8a80",
  }),

  /** Inside of the thermometer tube. */
  thermometerBackgroundColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "thermometerBackground", {
    default: "#f5f5f5",
    projector: "#ffffff",
  }),

  /** Background of digital temperature readouts. */
  readoutBackgroundColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "readoutBackground", {
    default: "#0d1326",
    projector: "#ffffff",
  }),

  /** Heat-flow arrows from hot to cold. */
  heatArrowColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "heatArrow", {
    default: "#ff8a65",
    projector: "#e64a19",
  }),

  /** Aluminum sample. */
  aluminumColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "aluminum", {
    default: "#c8ccd2",
    projector: "#b0b6be",
  }),

  /** Iron sample. */
  ironColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "iron", {
    default: "#7d7f86",
    projector: "#6d6f76",
  }),

  /** Copper sample. */
  copperColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "copper", {
    default: "#d4834a",
    projector: "#b8652d",
  }),

  /** Silver sample. */
  silverColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "silver", {
    default: "#e2e5ea",
    projector: "#c3c7cd",
  }),

  /** Lead sample. */
  leadColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "lead", {
    default: "#6c7480",
    projector: "#5b636e",
  }),

  /** Unknown samples. */
  unknownColorProperty: new ProfileColorProperty(CalorimetryLabNamespace, "unknown", {
    default: "#9c8bc4",
    projector: "#7e6aa8",
  }),
};

export default CalorimetryLabColors;
