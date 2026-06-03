import { pitchClassToNoteName } from "../../music/notes";
import type { AccidentalPreference, PitchClass } from "../../types/music";
import { getRandomItem } from "../../utils/random";

const PITCH_CLASSES: readonly PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export type FindNotesQuestion = {
  targetPitchClass: PitchClass;
  targetNoteName: string;
};

export const generateFindNotesQuestion = (
  accidentalPreference: AccidentalPreference = "sharps"
): FindNotesQuestion => {
  const targetPitchClass = getRandomItem(PITCH_CLASSES);

  return {
    targetPitchClass,
    targetNoteName: pitchClassToNoteName(targetPitchClass, accidentalPreference)
  };
};
