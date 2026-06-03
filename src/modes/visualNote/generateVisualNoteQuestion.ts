import type { FretboardCellData } from "../../types/music";
import { getRandomItem } from "../../utils/random";

export type VisualNoteQuestion = {
  position: FretboardCellData;
  answerNoteName: string;
};

export const generateVisualNoteQuestion = (
  cells: FretboardCellData[]
): VisualNoteQuestion => {
  const position = getRandomItem(cells);

  return {
    position,
    answerNoteName: position.noteName
  };
};
