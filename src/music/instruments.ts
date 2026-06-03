import type { InstrumentType, StringNumber, Tuning } from "../types/music";
import { STANDARD_TUNINGS } from "./tunings";

export const INSTRUMENT_OPTIONS: Array<{
  type: InstrumentType;
  label: string;
}> = [
  { type: "sixStringGuitar", label: "6-string guitar" },
  { type: "sevenStringGuitar", label: "7-string guitar" }
];

export const getDefaultTuningForInstrument = (
  instrumentType: InstrumentType
): Tuning => {
  const tuning = STANDARD_TUNINGS.find(
    (candidate) => candidate.instrumentType === instrumentType
  );

  if (!tuning) {
    throw new Error(`No default tuning configured for ${instrumentType}`);
  }

  return tuning;
};

export const getStringNumbersForTuning = (tuning: Tuning): StringNumber[] =>
  tuning.strings.map((string) => string.stringNumber);
