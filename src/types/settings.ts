import type { AccidentalPreference, InstrumentType, StringNumber } from "./music";
import type { IntervalPlaybackMode } from "../modes/intervalListening/playInterval";

export type AppSettings = {
  instrumentType: InstrumentType;
  tuningId: string;
  startFret: number;
  endFret: number;
  selectedStrings: StringNumber[];
  accidentalPreference: AccidentalPreference;
  showNoteNames: boolean;
  showStringNames: boolean;
  showFretNumbers: boolean;
  highStringOnTop: boolean;
  allowedIntervals: string[];
  listeningPlaybackMode: IntervalPlaybackMode;
};
