import type { InstrumentType } from "./music";
import type { PracticeModeId } from "./modes";

export type AppSettings = {
  instrumentType: InstrumentType;
  modeId: PracticeModeId;
  fretStart: number;
  fretEnd: number;
};
