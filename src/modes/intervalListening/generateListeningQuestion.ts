import { SIMPLE_INTERVALS, type SimpleInterval } from "../../music/intervals";
import type { Tuning } from "../../types/music";
import { getRandomItem } from "../../utils/random";

export type ListeningQuestion = {
  rootMidi: number;
  targetMidi: number;
  interval: SimpleInterval;
};

type GenerateListeningQuestionParams = {
  tuning: Tuning;
  previousQuestion?: ListeningQuestion;
};

const ROOT_RANGE_BY_INSTRUMENT = {
  sixStringGuitar: { min: 40, max: 72 },
  sevenStringGuitar: { min: 35, max: 72 }
} as const;

const TARGET_MIDI_MAX = 84;

const getRandomInteger = (min: number, max: number): number => {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
    throw new Error(`Invalid integer range: ${min}-${max}`);
  }

  return min + Math.floor(Math.random() * (max - min + 1));
};

const isSameQuestion = (
  question: ListeningQuestion,
  previousQuestion: ListeningQuestion | undefined
): boolean =>
  previousQuestion !== undefined &&
  question.rootMidi === previousQuestion.rootMidi &&
  question.interval.id === previousQuestion.interval.id;

export const generateListeningQuestion = ({
  tuning,
  previousQuestion
}: GenerateListeningQuestionParams): ListeningQuestion => {
  const rootRange = ROOT_RANGE_BY_INSTRUMENT[tuning.instrumentType];
  const candidates = SIMPLE_INTERVALS.flatMap((interval) => {
    const maxRootForInterval = Math.min(
      rootRange.max,
      TARGET_MIDI_MAX - interval.semitones
    );

    if (maxRootForInterval < rootRange.min) {
      return [];
    }

    return Array.from(
      { length: maxRootForInterval - rootRange.min + 1 },
      (_, index) => {
        const rootMidi = rootRange.min + index;

        return {
          rootMidi,
          targetMidi: rootMidi + interval.semitones,
          interval
        };
      }
    );
  });

  if (candidates.length === 0) {
    throw new Error(`No listening questions available for tuning ${tuning.id}.`);
  }

  const nonRepeatingCandidates = candidates.filter(
    (candidate) => !isSameQuestion(candidate, previousQuestion)
  );

  return getRandomItem(
    nonRepeatingCandidates.length > 0 ? nonRepeatingCandidates : candidates
  );
};

export const getListeningRootRangeForTuning = (tuning: Tuning) =>
  ROOT_RANGE_BY_INSTRUMENT[tuning.instrumentType];

export const getListeningTargetMidiMax = (): number => TARGET_MIDI_MAX;

export const getRandomListeningRootMidi = (tuning: Tuning): number => {
  const range = getListeningRootRangeForTuning(tuning);

  return getRandomInteger(range.min, range.max);
};
