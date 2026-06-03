import { useEffect, useRef, useState } from "react";
import { FeedbackPanel } from "../../components/layout/FeedbackPanel";
import { PracticeLayout } from "../../components/layout/PracticeLayout";
import { SIMPLE_INTERVALS, type SimpleInterval } from "../../music/intervals";
import { shortcutLabelForIndex } from "../../utils/keyboard";
import { isKeyboardInputTarget } from "../../utils/keyboard";
import { useAnswerShortcuts } from "../../utils/useAnswerShortcuts";
import { useProgress } from "../../state/progressStore";
import { useSettings } from "../../state/settingsStore";
import type { FeedbackStatus, SessionStats } from "../../types/modes";
import type { Tuning } from "../../types/music";
import {
  generateListeningQuestion,
  getListeningRootRangeForTuning,
  getListeningTargetMidiMax,
  type ListeningQuestion
} from "./generateListeningQuestion";
import {
  playInterval,
  type IntervalPlaybackHandle,
  type IntervalPlaybackMode
} from "./playInterval";

type AnswerResult = {
  selectedIntervalId: SimpleInterval["id"];
  isCorrect: boolean;
};

const PLAYBACK_MODES: Array<{
  id: IntervalPlaybackMode;
  label: string;
}> = [
  { id: "melodicAscending", label: "Melodic" },
  { id: "harmonic", label: "Harmonic" }
];

const createQuestion = (
  tuning: Tuning,
  allowedIntervals: readonly string[],
  previousQuestion?: ListeningQuestion
): ListeningQuestion =>
  generateListeningQuestion({
    tuning,
    previousQuestion,
    allowedIntervals
  });

export function IntervalListeningMode() {
  const { activeTuning: tuning, settings, setSetting } = useSettings();
  const { recordProgress } = useProgress();
  const instrumentLabel = settings.instrumentType === "sevenStringGuitar" ? "7-string guitar" : "6-string guitar";
  const allowedIntervals = SIMPLE_INTERVALS.filter((interval) =>
    settings.allowedIntervals.includes(interval.id)
  );
  const [question, setQuestion] = useState<ListeningQuestion>(() =>
    createQuestion(tuning, settings.allowedIntervals)
  );
  const playbackMode = settings.listeningPlaybackMode;
  const setPlaybackMode = (mode: IntervalPlaybackMode) =>
    setSetting("listeningPlaybackMode", mode);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const [hasAudioInteraction, setHasAudioInteraction] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [stats, setStats] = useState<SessionStats>({
    totalQuestions: 0,
    correct: 0,
    incorrect: 0,
    currentStreak: 0
  });
  const playbackRef = useRef<IntervalPlaybackHandle | null>(null);

  const stopPlayback = () => {
    playbackRef.current?.stop();
    playbackRef.current = null;
  };

  const handlePlay = (markInteraction = true) => {
    stopPlayback();
    setPlaybackError(null);

    try {
      const playback = playInterval({
        rootMidi: question.rootMidi,
        targetMidi: question.targetMidi,
        mode: playbackMode
      });
      playbackRef.current = playback;
      void playback.finished.then(() => {
        if (playbackRef.current === playback) {
          playbackRef.current = null;
        }
      });

      if (markInteraction) {
        setHasAudioInteraction(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to play audio.";
      setPlaybackError(message);
    }
  };

  useEffect(() => {
    stopPlayback();
    setQuestion(createQuestion(tuning, settings.allowedIntervals));
    setAnswerResult(null);
    setAutoAdvanceCountdown(null);
    setPlaybackError(null);

    return stopPlayback;
  }, [tuning, settings.allowedIntervals]);

  useEffect(() => {
    if (hasAudioInteraction) {
      handlePlay(false);
    }
  }, [question, playbackMode]);

  const handleAnswer = (intervalId: SimpleInterval["id"]) => {
    if (answerResult) {
      return;
    }

    const isCorrect = intervalId === question.interval.id;

    recordProgress({
      isCorrect,
      instrumentType: settings.instrumentType,
      tuningId: settings.tuningId,
      intervalId: question.interval.id
    });
    setStats((currentStats) => ({
      totalQuestions: currentStats.totalQuestions + 1,
      correct: currentStats.correct + (isCorrect ? 1 : 0),
      incorrect: currentStats.incorrect + (isCorrect ? 0 : 1),
      currentStreak: isCorrect ? currentStats.currentStreak + 1 : 0
    }));

    if (isCorrect) {
      handleNextQuestion();
      return;
    }

    setAnswerResult({ selectedIntervalId: intervalId, isCorrect });
    setAutoAdvanceCountdown(3);
  };

  const handleNextQuestion = () => {
    setQuestion(createQuestion(tuning, settings.allowedIntervals, question));
    setAnswerResult(null);
    setAutoAdvanceCountdown(null);
    setPlaybackError(null);
  };

  useEffect(() => {
    if (!answerResult || answerResult.isCorrect || autoAdvanceCountdown === null) {
      return;
    }

    if (autoAdvanceCountdown <= 0) {
      handleNextQuestion();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAutoAdvanceCountdown((currentCountdown) =>
        currentCountdown === null ? null : currentCountdown - 1
      );
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [answerResult, autoAdvanceCountdown, question]);

  useAnswerShortcuts({
    answerCount: allowedIntervals.length,
    canAnswer: answerResult === null,
    canGoNext: answerResult !== null,
    onAnswer: (index) => handleAnswer(allowedIntervals[index].id),
    onNext: handleNextQuestion
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isKeyboardInputTarget(event.target)) {
        return;
      }

      if (event.key === " ") {
        event.preventDefault();
        handlePlay(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [question, playbackMode]);

  const rootRange = getListeningRootRangeForTuning(tuning);
  const feedbackStatus: FeedbackStatus = playbackError
    ? "incorrect"
    : answerResult
      ? answerResult.isCorrect
        ? "correct"
        : "incorrect"
      : "neutral";
  const feedbackMessage = playbackError
    ? playbackError
    : answerResult
      ? `${answerResult.isCorrect ? "Correct" : "Incorrect"}. The interval is ${question.interval.label} (${question.interval.shortLabel}). Root MIDI ${question.rootMidi}, target MIDI ${question.targetMidi}.${answerResult.isCorrect || autoAdvanceCountdown === null ? "" : ` Next question in ${autoAdvanceCountdown}.`}`
      : `Listen and identify the interval. Root range: MIDI ${rootRange.min}-${rootRange.max}; target max MIDI ${getListeningTargetMidiMax()}.`;

  return (
    <PracticeLayout
      title="Interval listening"
      instructions="Listen to the notes, then choose the interval you hear."
      instrumentLabel={instrumentLabel}
      tuning={tuning}
      stats={stats}
      practiceContent={
        <div className="flex min-h-[14rem] flex-col items-center justify-center gap-4 rounded border border-slate-200 bg-slate-50 p-6 text-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Ear training
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              Identify the interval
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PLAYBACK_MODES.map((mode) => {
              const isSelected = mode.id === playbackMode;

              return (
                <button
                  className={`h-10 rounded border px-4 text-sm font-medium transition ${
                    isSelected
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-slate-300 bg-white text-slate-800 hover:border-emerald-500 hover:text-emerald-700"
                  }`}
                  key={mode.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setHasAudioInteraction(true);
                    setPlaybackMode(mode.id);
                  }}
                >
                  {mode.label}
                </button>
              );
            })}
            <button
              className="h-10 rounded border border-slate-300 bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
              type="button"
              onClick={() => handlePlay(true)}
            >
              Play
            </button>
          </div>
        </div>
      }
      answerArea={
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-[repeat(13,minmax(0,1fr))]">
            {allowedIntervals.map((interval, index) => {
              const isSelected = answerResult?.selectedIntervalId === interval.id;
              const isCorrectAnswer = interval.id === question.interval.id;
              const isWrongAnswer = answerResult !== null && !answerResult.isCorrect;
              const answerStateClass = isWrongAnswer && isSelected
                ? "border-red-600 bg-red-50 text-red-700"
                : isWrongAnswer && isCorrectAnswer
                  ? "animate-pulse border-emerald-700 bg-emerald-100 text-emerald-800 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]"
                  : isSelected
                    ? "border-emerald-600 text-emerald-700"
                    : "border-slate-300 text-slate-800 hover:border-emerald-500 hover:text-emerald-700";

              return (
                <button
                  className={`flex h-11 items-center justify-center rounded border px-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed ${answerStateClass}`}
                  disabled={answerResult !== null}
                  key={interval.id}
                  type="button"
                  onClick={(event) => {
                    event.currentTarget.blur();
                    handleAnswer(interval.id);
                  }}
                >
                  <span>{interval.shortLabel}</span>
                  <span className="ml-1 text-xs opacity-60">{shortcutLabelForIndex(index)}</span>
                </button>
              );
            })}
          </div>
          <button
            className="flex h-11 items-center justify-center rounded border border-slate-300 bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={answerResult === null}
            type="button"
            onClick={handleNextQuestion}
          >
            Next question
          </button>
        </div>
      }
      feedbackArea={<FeedbackPanel status={feedbackStatus} message={feedbackMessage} />}
    />
  );
}
