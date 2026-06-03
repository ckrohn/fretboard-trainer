import { getFretboardCells } from "../../music/fretboard";
import { getIntervalBySemitones, type SimpleInterval } from "../../music/intervals";
import type {
  FretboardCellData,
  FretboardPosition,
  StringNumber,
  Tuning
} from "../../types/music";
import { getRandomItem } from "../../utils/random";

export type VisualIntervalQuestion = {
  root: FretboardCellData;
  target: FretboardCellData;
  interval: SimpleInterval;
};

type GenerateVisualIntervalQuestionParams = {
  tuning: Tuning;
  selectedStrings: readonly StringNumber[];
  startFret?: number;
  endFret?: number;
  previousRoot?: FretboardPosition;
  previousTarget?: FretboardPosition;
};

type CandidatePair = {
  root: FretboardCellData;
  target: FretboardCellData;
  interval: SimpleInterval;
};

const isSamePosition = (
  cell: FretboardCellData,
  position: FretboardPosition | undefined
): boolean =>
  position !== undefined &&
  cell.stringNumber === position.stringNumber &&
  cell.fret === position.fret;

const isSameQuestion = (
  candidate: CandidatePair,
  previousRoot: FretboardPosition | undefined,
  previousTarget: FretboardPosition | undefined
): boolean =>
  isSamePosition(candidate.root, previousRoot) &&
  isSamePosition(candidate.target, previousTarget);

const buildCandidatePairs = (cells: readonly FretboardCellData[]): CandidatePair[] =>
  cells.flatMap((root) =>
    cells.flatMap((target) => {
      const semitones = target.midi - root.midi;

      if (semitones < 0 || semitones > 12) {
        return [];
      }

      if (
        semitones !== 0 &&
        root.stringNumber === target.stringNumber &&
        root.fret === target.fret
      ) {
        return [];
      }

      try {
        return [{ root, target, interval: getIntervalBySemitones(semitones) }];
      } catch {
        return [];
      }
    })
  );

export const generateVisualIntervalQuestion = ({
  tuning,
  selectedStrings,
  startFret = 0,
  endFret = 12,
  previousRoot,
  previousTarget
}: GenerateVisualIntervalQuestionParams): VisualIntervalQuestion => {
  const cells = getFretboardCells(
    tuning,
    startFret,
    endFret,
    selectedStrings,
    "sharps"
  );
  const candidates = buildCandidatePairs(cells);

  if (candidates.length === 0) {
    throw new Error("No valid visual interval questions are available for the active tuning and fret range.");
  }

  const nonRepeatingCandidates = candidates.filter(
    (candidate) => !isSameQuestion(candidate, previousRoot, previousTarget)
  );
  const question = getRandomItem(
    nonRepeatingCandidates.length > 0 ? nonRepeatingCandidates : candidates
  );

  return question;
};
