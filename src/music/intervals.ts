import type { Interval } from "../types/music";

export const SIMPLE_INTERVALS = [
  { id: "P1", label: "Unison", shortLabel: "P1", semitones: 0 },
  { id: "m2", label: "Minor 2nd", shortLabel: "m2", semitones: 1 },
  { id: "M2", label: "Major 2nd", shortLabel: "M2", semitones: 2 },
  { id: "m3", label: "Minor 3rd", shortLabel: "m3", semitones: 3 },
  { id: "M3", label: "Major 3rd", shortLabel: "M3", semitones: 4 },
  { id: "P4", label: "Perfect 4th", shortLabel: "P4", semitones: 5 },
  { id: "TT", label: "Tritone", shortLabel: "TT", semitones: 6 },
  { id: "P5", label: "Perfect 5th", shortLabel: "P5", semitones: 7 },
  { id: "m6", label: "Minor 6th", shortLabel: "m6", semitones: 8 },
  { id: "M6", label: "Major 6th", shortLabel: "M6", semitones: 9 },
  { id: "m7", label: "Minor 7th", shortLabel: "m7", semitones: 10 },
  { id: "M7", label: "Major 7th", shortLabel: "M7", semitones: 11 },
  { id: "P8", label: "Octave", shortLabel: "P8", semitones: 12 }
] as const satisfies readonly Interval[];

export type SimpleInterval = (typeof SIMPLE_INTERVALS)[number];

export const getIntervalBySemitones = (semitones: number): SimpleInterval => {
  if (!Number.isInteger(semitones)) {
    throw new Error(`Interval semitones must be an integer. Received: ${semitones}`);
  }

  const interval = SIMPLE_INTERVALS.find(
    (candidate) => candidate.semitones === semitones
  );

  if (!interval) {
    throw new Error(`No supported interval found for ${semitones} semitones.`);
  }

  return interval;
};
