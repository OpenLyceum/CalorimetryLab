/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screens, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. Each module imports the next, so the import nesting is
 *
 *   main → brand → splash → assert → init
 *
 * and therefore the actual EXECUTION order (deepest import runs first) is the reverse:
 *
 *   init → assert → splash → brand → main
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first; importing it runs the whole chain (init→assert→splash→brand) before main.
import "./brand.js";

import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { BombCalorimeterScreen } from "./bomb/BombCalorimeterScreen.js";
import CalorimetryLabColors from "./CalorimetryLabColors.js";
import { CoffeeCupScreen } from "./coffee-cup/CoffeeCupScreen.js";
import { HessLawScreen } from "./hess-law/HessLawScreen.js";
import { StringManager } from "./i18n/StringManager.js";
import { CalorimetryLabPreferencesModel } from "./preferences/CalorimetryLabPreferencesModel.js";
import { CalorimetryLabPreferencesNode } from "./preferences/CalorimetryLabPreferencesNode.js";
import { SpecificHeatScreen } from "./specific-heat/SpecificHeatScreen.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();

  // Simulation-specific preferences; initial values come from calorimetryLabQueryParameters.
  const simPreferences = new CalorimetryLabPreferencesModel(Tandem.ROOT.createTandem("preferences"));

  const screens = [
    new SpecificHeatScreen({
      name: stringManager.getScreenNames().specificHeatStringProperty,
      tandem: Tandem.ROOT.createTandem("specificHeatScreen"),
      showCalculationsProperty: simPreferences.showCalculationsProperty,
      backgroundColorProperty: CalorimetryLabColors.backgroundColorProperty,
    }),
    new CoffeeCupScreen({
      name: stringManager.getScreenNames().coffeeCupStringProperty,
      tandem: Tandem.ROOT.createTandem("coffeeCupScreen"),
      showCalculationsProperty: simPreferences.showCalculationsProperty,
      backgroundColorProperty: CalorimetryLabColors.backgroundColorProperty,
    }),
    new BombCalorimeterScreen({
      name: stringManager.getScreenNames().bombStringProperty,
      tandem: Tandem.ROOT.createTandem("bombScreen"),
      showCalculationsProperty: simPreferences.showCalculationsProperty,
      backgroundColorProperty: CalorimetryLabColors.backgroundColorProperty,
    }),
    new HessLawScreen({
      name: stringManager.getScreenNames().hessLawStringProperty,
      tandem: Tandem.ROOT.createTandem("hessLawScreen"),
      showCalculationsProperty: simPreferences.showCalculationsProperty,
      backgroundColorProperty: CalorimetryLabColors.backgroundColorProperty,
    }),
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      simulationOptions: {
        customPreferences: [
          {
            createContent: (tandem: Tandem) => new CalorimetryLabPreferencesNode(simPreferences, tandem),
          },
        ],
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
    }),

    // Optional: fill in credits shown in Help → About
    credits: {
      leadDesign: "",
      softwareDevelopment: "",
      team: "",
      qualityAssurance: "",
    },
  });

  sim.start();
});
