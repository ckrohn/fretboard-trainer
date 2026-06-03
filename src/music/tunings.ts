import type { Tuning } from "../types/music";

export const STANDARD_6_STRING_TUNING: Tuning = {
  id: "standard-6",
  label: "Standard 6-string: E A D G B E",
  instrumentType: "sixStringGuitar",
  stringCount: 6,
  strings: [
    { stringNumber: 6, openNoteName: "E", openMidi: 40 },
    { stringNumber: 5, openNoteName: "A", openMidi: 45 },
    { stringNumber: 4, openNoteName: "D", openMidi: 50 },
    { stringNumber: 3, openNoteName: "G", openMidi: 55 },
    { stringNumber: 2, openNoteName: "B", openMidi: 59 },
    { stringNumber: 1, openNoteName: "E", openMidi: 64 }
  ]
};

export const STANDARD_7_STRING_TUNING: Tuning = {
  id: "standard-7",
  label: "Standard 7-string: B E A D G B E",
  instrumentType: "sevenStringGuitar",
  stringCount: 7,
  strings: [
    { stringNumber: 7, openNoteName: "B", openMidi: 35 },
    { stringNumber: 6, openNoteName: "E", openMidi: 40 },
    { stringNumber: 5, openNoteName: "A", openMidi: 45 },
    { stringNumber: 4, openNoteName: "D", openMidi: 50 },
    { stringNumber: 3, openNoteName: "G", openMidi: 55 },
    { stringNumber: 2, openNoteName: "B", openMidi: 59 },
    { stringNumber: 1, openNoteName: "E", openMidi: 64 }
  ]
};

export const STANDARD_TUNINGS = [
  STANDARD_6_STRING_TUNING,
  STANDARD_7_STRING_TUNING
] as const satisfies readonly Tuning[];

export const ALL_TUNINGS = STANDARD_TUNINGS;

export const getTuningById = (tuningId: string): Tuning => {
  const tuning = ALL_TUNINGS.find((candidate) => candidate.id === tuningId);

  if (!tuning) {
    throw new Error(`Unknown tuning id: ${tuningId}`);
  }

  return tuning;
};
