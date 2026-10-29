# Calorimetry Lab

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

Calorimetry and Hess's law for introductory (General) chemistry. Drop a hot metal into water and
find its specific heat; mix solutions in a coffee-cup calorimeter and work out ΔH per mole;
calibrate a bomb calorimeter with benzoic acid and burn fuels; and build a reaction's ΔH from
step reactions. Built with [SceneryStack](https://scenerystack.org/); runs offline as a
Progressive Web App.

## Features

- **Specific Heat.** Heat a sample (aluminum, iron, copper, silver, lead, or one of two
  unknowns) in a water bath and drop it into an insulated cup of water. Sample and water
  temperatures converge on a live chart, heat arrows show the flow, and the calculation shows
  q = mcΔT for each, with q(sample) = −q(water). With an unknown, students work out c and then
  reveal the metal. Take the insulation away and the balance shows heat lost to the room.
- **Coffee Cup.** HCl + NaOH, dissolving five salts (NH₄NO₃, NaOH, CaCl₂, NH₄Cl, KNO₃) or Mg in
  HCl. Set volumes, concentrations, masses and the starting temperature, then mix. The worked
  calculation goes ΔT → q(solution) → q(reaction) → n (with the limiting reactant) → ΔH in
  kJ/mol, compared with the accepted value. Endothermic dissolving visibly cools the cup. A
  non-ideal cup holds some heat and leaks to the room, so the curve peaks and drifts; the
  textbook extrapolation back to the moment of mixing is drawn on the chart and recovers ΔH.
- **Bomb Calorimeter.** Calibrate: burn benzoic acid (26.434 kJ/g) to find the calorimeter
  constant, which the screen never shows. Measure: burn sucrose, glucose, naphthalene or ethanol
  with your own C_cal and get ΔcU per gram and per mole, then ΔcH = ΔcU + Δn(gas)RT. The
  thermometer reads to 0.001 °C.
- **Hess's Law.** Six puzzles (CO from graphite, graphite to diamond, ΔHf of CH₄ and C₂H₂,
  2NO₂ → N₂O₄, S → SO₃). Reverse and multiply each step; the sum strikes out species that
  cancel, checks the net equation against the target, and adds the ΔH values. An enthalpy
  ladder diagram draws each step; a second view routes the reaction through the elements with
  ΔH° = ΣνΔHf°(products) − ΣνΔHf°(reactants).
- Data from the CRC Handbook and the NIST Chemistry WebBook (the values in OpenStax
  *Chemistry 2e*, chapter 5 and Appendix G); sources in [`doc/model.md`](doc/model.md).
- **Accessible:** every control is keyboard-operable; dropping, mixing, igniting, reaching
  equilibrium and solving a puzzle are announced; live screen summaries; keyboard-help dialogs.
- English, French and Spanish; default and projector colour profiles; installable PWA. A
  preference (or `?calculations=false`) hides the worked calculations so students do them.

## Quick Start

```bash
npm install
npm run icons    # generate PNG icons from public/icons/icon.svg
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run test:fuzz` | Optional Playwright fuzz smoke: pointer (`?fuzz`) + keyboard (`?fuzzBoard`), with `?ea`, 30s each |
| `npm run test:fuzz -- 90` | Same fuzz for 90 seconds (`--duration 90` or `FUZZ_DURATION=90` also work) |
| `npm run test:fuzz:quick` | Shorter fuzz smoke (10s) |
| `npm run test:fuzz:long` | Longer fuzz smoke (300s) |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run rename` | Sim-level fork/rename (`--id`, `--name`) |
| `npm run scaffold-screens` | Emit N fleet-named screen packages from `specific-heat/` (`--shared-model` optional) |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |
| `npm run clean` | Remove `dist/` |

New sims start at `version: "0.0.0"` in `package.json`. Bump only when cutting a release (for example `npm version patch` and a matching git tag). Keep `name` in kebab-case; it is separate from the SceneryStack sim identifier in `src/init.ts`, which reads its `version` from `package.json`.

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.5 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^2 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenLyceum org license](https://github.com/OpenLyceum/.github/blob/main/LICENSE).

## Contributing

See [OpenLyceum contributing guidelines](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
