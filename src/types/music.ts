export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type AccidentalPreference = "sharps" | "flats";

export type StringNumber = number;

export type InstrumentType = "sixStringGuitar" | "sevenStringGuitar";

export type GuitarString = {
  stringNumber: StringNumber;
  openNoteName: string;
  openMidi: number;
};

export type Tuning = {
  id: string;
  label: string;
  instrumentType: InstrumentType;
  stringCount: number;
  strings: GuitarString[];
};

export type FretboardPosition = {
  stringNumber: StringNumber;
  fret: number;
};

export type FretboardCellData = FretboardPosition & {
  midi: number;
  pitchClass: PitchClass;
  noteName: string;
};

export type FretboardMarkerType =
  | "root"
  | "target"
  | "selected"
  | "correct"
  | "incorrect"
  | "missed";

export type FretboardMarker = FretboardPosition & {
  type: FretboardMarkerType;
};

export type Interval = {
  id: string;
  label: string;
  shortLabel: string;
  semitones: number;
};
