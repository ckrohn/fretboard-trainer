import type { AccidentalPreference, PitchClass } from "../types/music";

export const SHARP_NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B"
] as const satisfies readonly string[];

export const FLAT_NOTE_NAMES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B"
] as const satisfies readonly string[];

const NOTE_NAME_TO_PITCH_CLASS = new Map<string, PitchClass>([
  ["C", 0],
  ["B#", 0],
  ["C#", 1],
  ["DB", 1],
  ["D", 2],
  ["D#", 3],
  ["EB", 3],
  ["E", 4],
  ["FB", 4],
  ["E#", 5],
  ["F", 5],
  ["F#", 6],
  ["GB", 6],
  ["G", 7],
  ["G#", 8],
  ["AB", 8],
  ["A", 9],
  ["A#", 10],
  ["BB", 10],
  ["B", 11],
  ["CB", 11]
]);

export const isPitchClass = (value: number): value is PitchClass =>
  Number.isInteger(value) && value >= 0 && value <= 11;

export const toPitchClass = (midi: number): PitchClass => {
  if (!Number.isFinite(midi)) {
    throw new Error(`MIDI value must be a finite number. Received: ${midi}`);
  }

  return (((midi % 12) + 12) % 12) as PitchClass;
};

export const noteNameToPitchClass = (noteName: string): PitchClass => {
  const normalized = noteName.trim().toUpperCase();

  if (normalized.length === 0) {
    throw new Error("Note name cannot be empty.");
  }

  const pitchClass = NOTE_NAME_TO_PITCH_CLASS.get(normalized);

  if (pitchClass === undefined) {
    throw new Error(`Unsupported note name: ${noteName}`);
  }

  return pitchClass;
};

export const pitchClassToNoteName = (
  pitchClass: PitchClass,
  accidentalPreference: AccidentalPreference = "sharps"
): string => {
  if (!isPitchClass(pitchClass)) {
    throw new Error(`Pitch class must be an integer from 0 to 11. Received: ${pitchClass}`);
  }

  return accidentalPreference === "flats"
    ? FLAT_NOTE_NAMES[pitchClass]
    : SHARP_NOTE_NAMES[pitchClass];
};

export const noteNameForPitchClass = pitchClassToNoteName;
