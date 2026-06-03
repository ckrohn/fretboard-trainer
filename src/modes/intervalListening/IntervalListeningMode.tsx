import { useEffect, useRef, useState } from "react";
import { FeedbackPanel } from "../../components/layout/FeedbackPanel";
import { PracticeLayout } from "../../components/layout/PracticeLayout";
import { SIMPLE_INTERVALS, type SimpleInterval } from "../../music/intervals";
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

type IntervalListeningModeProps = {
  instrumentLabel: string;
  tuning: Tuning;
};

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
  previousQuestion?: ListeningQuestion
): ListeningQuestion =>
  generateListeningQuestion({
    tuning,
    previousQuestion
  });

export function IntervalListeningMode({
  instrumentLabel,
  tuning
}: IntervalListeningModeProps) {
  const [question, setQuestion] = useState<ListeningQuestion>(() =>
    createQuestion(tuning)
  );
  const [playbackMode, setPlaybackMode] =
    useState<IntervalPlaybackMode>("melodicAscending");
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
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
    setQuestion(createQuestion(tuning));
    setAnswerResult(null);
    setPlaybackError(null);

    return stopPlayback;
  }, [tuning]);

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

    setAnswerResult({ selectedIntervalId: intervalId, isCorrect });
    setStats((currentStats) => ({
      totalQuestions: currentStats.totalQuestions + 1,
      correct: currentStats.correct + (isCorrect ? 1 : 0),
      incorrect: currentStats.incorrect + (isCorrect ? 0 : 1),
      currentStreak: isCorrect ? currentStats.currentStreak + 1 : 0
    }));
  };

  const handleNextQuestion = () => {
    setQuestion(createQuestion(tuning, question));
    setAnswerResult(null);
    setPlaybackError(null);
  };

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
      ? `${answerResult.isCorrect ? "Correct" : "Incorrect"}. The interval is ${question.interval.label} (${question.interval.shortLabel}). Root MIDI ${question.rootMidi}, target MIDI ${question.targetMidi}.`
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
            {SIMPLE_INTERVALS.map((interval) => {
              const isSelected = answerResult?.selectedIntervalId === interval.id;

              return (
                <button
                  className={`h-10 rounded border bg-white text-sm font-medium transition disabled:cursor-not-allowed ${
                    isSelected
                      ? "border-emerald-600 text-emerald-700"
                      : "border-slate-300 text-slate-800 hover:border-emerald-500 hover:text-emerald-700"
                  }`}
                  disabled={answerResult !== null}
                  key={interval.id}
                  type="button"
                  onClick={() => handleAnswer(interval.id)}
                >
                  {interval.shortLabel}
                </button>
              );
            })}
          </div>
          <button
            className="h-10 rounded border border-slate-300 bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
