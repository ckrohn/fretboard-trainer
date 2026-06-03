import type {
  AccidentalPreference,
  FretboardCellData,
  StringNumber,
  Tuning
} from "../types/music";
import { pitchClassToNoteName, toPitchClass } from "./notes";
import { getStringNumbersForTuning } from "./instruments";

const assertValidFretRange = (startFret: number, endFret: number): void => {
  if (!Number.isInteger(startFret) || !Number.isInteger(endFret)) {
    throw new Error("Fret range must use integer fret numbers.");
  }

  if (startFret < 0 || endFret < 0) {
    throw new Error("Fret numbers cannot be negative.");
  }

  if (startFret > endFret) {
    throw new Error(
      `Start fret cannot be greater than end fret. Received ${startFret}-${endFret}.`
    );
  }
};

export const getDisplayStrings = (tuning: Tuning) =>
  [...tuning.strings].sort((a, b) => a.stringNumber - b.stringNumber);

export const getFrets = (start: number, end: number): number[] => {
  assertValidFretRange(start, end);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export const validateSelectedStrings = (
  tuning: Tuning,
  selectedStrings: readonly StringNumber[]
): void => {
  if (selectedStrings.length === 0) {
    throw new Error("At least one string must be selected.");
  }

  const availableStrings = new Set(getStringNumbersForTuning(tuning));
  const invalidStrings = selectedStrings.filter(
    (stringNumber) => !availableStrings.has(stringNumber)
  );

  if (invalidStrings.length > 0) {
    throw new Error(
      `Selected string(s) ${invalidStrings.join(", ")} are not valid for tuning ${tuning.id}.`
    );
  }
};

export const getFretboardCells = (
  tuning: Tuning,
  startFret: number,
  endFret: number,
  selectedStrings: readonly StringNumber[],
  accidentalPreference: AccidentalPreference = "sharps"
): FretboardCellData[] => {
  const frets = getFrets(startFret, endFret);
  validateSelectedStrings(tuning, selectedStrings);
  const selectedStringSet = new Set(selectedStrings);

  return getDisplayStrings(tuning)
    .filter((string) => selectedStringSet.has(string.stringNumber))
    .flatMap((string) =>
      frets.map((fret) => {
        const midi = string.openMidi + fret;
        const pitchClass = toPitchClass(midi);

        return {
          stringNumber: string.stringNumber,
          fret,
          midi,
          pitchClass,
          noteName: pitchClassToNoteName(pitchClass, accidentalPreference)
        };
      })
    );
};

export const buildFretboard = (
  tuning: Tuning,
  fretStart: number,
  fretEnd: number,
  accidentalPreference: AccidentalPreference = "sharps"
): FretboardCellData[][] => {
  const selectedStrings = getDisplayStrings(tuning).map((string) => string.stringNumber);
  const cells = getFretboardCells(
    tuning,
    fretStart,
    fretEnd,
    selectedStrings,
    accidentalPreference
  );

  return selectedStrings.map((stringNumber) =>
    cells.filter((cell) => cell.stringNumber === stringNumber)
  );
};
