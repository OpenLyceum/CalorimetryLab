/**
 * ExperimentPhase.ts
 *
 * Every calorimeter screen runs one trial at a time: the student sets it up ("ready"), starts it
 * (drops the sample, mixes the solutions or fires the bomb) and watches it run ("running"). The
 * setup controls are disabled while a trial runs; "New Trial" goes back to "ready".
 */

export type ExperimentPhase = "ready" | "running";
