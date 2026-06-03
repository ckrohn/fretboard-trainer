import { getFretboardCells } from "../../music/fretboard";
import { pitchClassToNoteName } from "../../music/notes";
import type {
  FretboardCellData,
  FretboardPosition,
  StringNumber,
  Tuning
} from "../../types/music";
import { getRandomItem } from "../../utils/random";

export type VisualNoteQuestion = {
  position: FretboardCellData;
  answerNoteName: string;
};

type GenerateVisualNoteQuestionParams = {
  tuning: Tuning;
  selectedStrings: readonly StringNumber[];
  startFret?: number;
  endFret?: number;
  previousPosition?: FretboardPosition;
};

const isSamePosition = (
  cell: FretboardCellData,
  position: FretboardPosition | undefined
): boolean =>
  position !== undefined &&
  cell.stringNumber === position.stringNumber &&
  cell.fret === position.fret;

export const generateVisualNoteQuestion = ({
  tuning,
  selectedStrings,
  startFret = 0,
  endFret = 12,
  previousPosition
}: GenerateVisualNoteQuestionParams): VisualNoteQuestion => {
  const cells = getFretboardCells(
    tuning,
    startFret,
    endFret,
    selectedStrings,
    "sharps"
  );
  const eligibleCells = cells.filter((cell) => !isSamePosition(cell, previousPosition));
  const position = getRandomItem(eligibleCells.length > 0 ? eligibleCells : cells);

  return {
    position,
    answerNoteName: pitchClassToNoteName(position.pitchClass, "sharps")
  };
};
