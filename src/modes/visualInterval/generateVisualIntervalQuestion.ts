import type { FretboardCellData } from "../../types/music";
import { SIMPLE_INTERVALS } from "../../music/intervals";
import { getRandomItem } from "../../utils/random";

export type VisualIntervalQuestion = {
  root: FretboardCellData;
  target: FretboardCellData;
  intervalId: (typeof SIMPLE_INTERVALS)[number]["id"];
};

export const generateVisualIntervalQuestion = (
  cells: FretboardCellData[]
): VisualIntervalQuestion => {
  const root = getRandomItem(cells);
  const candidates = cells.filter((cell) => cell.midi >= root.midi);
  const target = getRandomItem(candidates.length > 0 ? candidates : cells);
  const semitones = target.midi - root.midi;
  const interval =
    SIMPLE_INTERVALS.find((candidate) => candidate.semitones === semitones) ??
    SIMPLE_INTERVALS[0];

  return {
    root,
    target,
    intervalId: interval.id
  };
};
