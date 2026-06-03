import type { FretboardCellData, FretboardPosition, PitchClass } from "../../types/music";

export type FindNotesEvaluation = {
  correctSelected: FretboardPosition[];
  missed: FretboardPosition[];
  wrongSelected: FretboardPosition[];
  isPerfect: boolean;
};

const positionKey = (position: FretboardPosition): string =>
  `${position.stringNumber}-${position.fret}`;

const toPosition = (cell: FretboardCellData): FretboardPosition => ({
  stringNumber: cell.stringNumber,
  fret: cell.fret
});

const sortPositions = (positions: FretboardPosition[]): FretboardPosition[] =>
  [...positions].sort((a, b) =>
    a.stringNumber === b.stringNumber ? a.fret - b.fret : a.stringNumber - b.stringNumber
  );

const uniquePositions = (
  positions: readonly FretboardPosition[]
): FretboardPosition[] => {
  const positionsByKey = new Map<string, FretboardPosition>();

  positions.forEach((position) => {
    positionsByKey.set(positionKey(position), position);
  });

  return Array.from(positionsByKey.values());
};

export const evaluateFindNotesAnswer = (
  cells: readonly FretboardCellData[],
  targetPitchClass: PitchClass,
  selectedPositions: readonly FretboardPosition[]
): FindNotesEvaluation => {
  const correctPositions = cells
    .filter((cell) => cell.pitchClass === targetPitchClass)
    .map(toPosition);
  const correctPositionKeys = new Set(correctPositions.map(positionKey));
  const selected = uniquePositions(selectedPositions);
  const selectedPositionKeys = new Set(selected.map(positionKey));

  const correctSelected = selected.filter((position) =>
    correctPositionKeys.has(positionKey(position))
  );
  const missed = correctPositions.filter(
    (position) => !selectedPositionKeys.has(positionKey(position))
  );
  const wrongSelected = selected.filter(
    (position) => !correctPositionKeys.has(positionKey(position))
  );

  return {
    correctSelected: sortPositions(correctSelected),
    missed: sortPositions(missed),
    wrongSelected: sortPositions(wrongSelected),
    isPerfect: missed.length === 0 && wrongSelected.length === 0
  };
};
