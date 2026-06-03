import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LOCAL_STORAGE_KEYS, readLocalStorageJson, removeLocalStorageValue, writeLocalStorageJson } from "../utils/localStorage";
import type { InstrumentType, StringNumber } from "../types/music";

type ProgressBucket = {
  attempts: number;
  correct: number;
};

export type ProgressState = {
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  bestStreak: number;
  currentStreak: number;
  perInterval: Record<string, ProgressBucket>;
  perNote: Record<string, ProgressBucket>;
  perInstrument: Record<string, ProgressBucket>;
  perTuning: Record<string, ProgressBucket>;
  perString: Record<string, ProgressBucket>;
};

export type ProgressEvent = {
  isCorrect: boolean;
  instrumentType: InstrumentType;
  tuningId: string;
  intervalId?: string;
  noteName?: string;
  stringNumber?: StringNumber;
  stringNumbers?: readonly StringNumber[];
};

export const INITIAL_PROGRESS_STATE: ProgressState = {
  totalAttempts: 0,
  correctAttempts: 0,
  incorrectAttempts: 0,
  bestStreak: 0,
  currentStreak: 0,
  perInterval: {},
  perNote: {},
  perInstrument: {},
  perTuning: {},
  perString: {}
};

type ProgressContextValue = {
  progress: ProgressState;
  recordProgress: (event: ProgressEvent) => void;
  resetProgress: () => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const sanitizeBucketRecord = (value: unknown): Record<string, ProgressBucket> => {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, bucket]) => {
      if (!isRecord(bucket)) {
        return [];
      }

      const attempts = Number(bucket.attempts);
      const correct = Number(bucket.correct);

      return [
        [
          key,
          {
            attempts: Number.isFinite(attempts) && attempts >= 0 ? Math.trunc(attempts) : 0,
            correct: Number.isFinite(correct) && correct >= 0 ? Math.trunc(correct) : 0
          }
        ]
      ];
    })
  );
};

const sanitizeProgress = (value: unknown): ProgressState => {
  if (!isRecord(value)) {
    return INITIAL_PROGRESS_STATE;
  }

  const totalAttempts = Number(value.totalAttempts);
  const correctAttempts = Number(value.correctAttempts);
  const incorrectAttempts = Number(value.incorrectAttempts);
  const bestStreak = Number(value.bestStreak);
  const currentStreak = Number(value.currentStreak);

  return {
    totalAttempts: Number.isFinite(totalAttempts) && totalAttempts >= 0 ? Math.trunc(totalAttempts) : 0,
    correctAttempts: Number.isFinite(correctAttempts) && correctAttempts >= 0 ? Math.trunc(correctAttempts) : 0,
    incorrectAttempts: Number.isFinite(incorrectAttempts) && incorrectAttempts >= 0 ? Math.trunc(incorrectAttempts) : 0,
    bestStreak: Number.isFinite(bestStreak) && bestStreak >= 0 ? Math.trunc(bestStreak) : 0,
    currentStreak: Number.isFinite(currentStreak) && currentStreak >= 0 ? Math.trunc(currentStreak) : 0,
    perInterval: sanitizeBucketRecord(value.perInterval),
    perNote: sanitizeBucketRecord(value.perNote),
    perInstrument: sanitizeBucketRecord(value.perInstrument),
    perTuning: sanitizeBucketRecord(value.perTuning),
    perString: sanitizeBucketRecord(value.perString)
  };
};

const incrementBucket = (
  buckets: Record<string, ProgressBucket>,
  key: string | undefined,
  isCorrect: boolean
): Record<string, ProgressBucket> => {
  if (!key) {
    return buckets;
  }

  const current = buckets[key] ?? { attempts: 0, correct: 0 };

  return {
    ...buckets,
    [key]: {
      attempts: current.attempts + 1,
      correct: current.correct + (isCorrect ? 1 : 0)
    }
  };
};

const incrementBuckets = (
  buckets: Record<string, ProgressBucket>,
  keys: readonly string[],
  isCorrect: boolean
): Record<string, ProgressBucket> =>
  Array.from(new Set(keys)).reduce(
    (currentBuckets, key) => incrementBucket(currentBuckets, key, isCorrect),
    buckets
  );

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() =>
    sanitizeProgress(readLocalStorageJson(LOCAL_STORAGE_KEYS.progress, INITIAL_PROGRESS_STATE))
  );

  useEffect(() => {
    writeLocalStorageJson(LOCAL_STORAGE_KEYS.progress, progress);
  }, [progress]);

  const recordProgress = (event: ProgressEvent) => {
    setProgress((current) => {
      const currentStreak = event.isCorrect ? current.currentStreak + 1 : 0;

      return {
        totalAttempts: current.totalAttempts + 1,
        correctAttempts: current.correctAttempts + (event.isCorrect ? 1 : 0),
        incorrectAttempts: current.incorrectAttempts + (event.isCorrect ? 0 : 1),
        bestStreak: Math.max(current.bestStreak, currentStreak),
        currentStreak,
        perInterval: incrementBucket(current.perInterval, event.intervalId, event.isCorrect),
        perNote: incrementBucket(current.perNote, event.noteName, event.isCorrect),
        perInstrument: incrementBucket(current.perInstrument, event.instrumentType, event.isCorrect),
        perTuning: incrementBucket(current.perTuning, event.tuningId, event.isCorrect),
        perString: incrementBuckets(
          current.perString,
          event.stringNumbers !== undefined
            ? event.stringNumbers.map(
                (stringNumber) => `${event.instrumentType}|${event.tuningId}|${stringNumber}`
              )
            : event.stringNumber === undefined
              ? []
              : [`${event.instrumentType}|${event.tuningId}|${event.stringNumber}`],
          event.isCorrect
        )
      };
    });
  };

  const resetProgress = () => {
    removeLocalStorageValue(LOCAL_STORAGE_KEYS.progress);
    setProgress(INITIAL_PROGRESS_STATE);
  };

  const value = useMemo<ProgressContextValue>(
    () => ({ progress, recordProgress, resetProgress }),
    [progress]
  );

  return createElement(ProgressContext.Provider, { value }, children);
}

export const useProgress = (): ProgressContextValue => {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error("useProgress must be used within ProgressProvider.");
  }

  return context;
};
