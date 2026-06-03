import { useEffect, useMemo, useState } from "react";
import { Fretboard } from "../../components/fretboard/Fretboard";
import { FeedbackPanel } from "../../components/layout/FeedbackPanel";
import { PracticeLayout } from "../../components/layout/PracticeLayout";
import { getFretboardCells } from "../../music/fretboard";
import { SIMPLE_INTERVALS, type SimpleInterval } from "../../music/intervals";
import type { SessionStats } from "../../types/modes";
import type {
  FretboardMarker,
  FretboardPosition,
  StringNumber,
  Tuning
} from "../../types/music";
import {
  generateVisualIntervalQuestion,
  type VisualIntervalQuestion
} from "./generateVisualIntervalQuestion";

type VisualIntervalModeProps = {
  instrumentLabel: string;
  selectedStrings: readonly StringNumber[];
  tuning: Tuning;
};

type AnswerResult = {
  selectedIntervalId: SimpleInterval["id"];
  isCorrect: boolean;
};

const START_FRET = 0;
const END_FRET = 12;

const createQuestion = (
  tuning: Tuning,
  selectedStrings: readonly StringNumber[],
  previousRoot?: FretboardPosition,
  previousTarget?: FretboardPosition
): VisualIntervalQuestion =>
  generateVisualIntervalQuestion({
    tuning,
    selectedStrings,
    startFret: START_FRET,
    endFret: END_FRET,
    previousRoot,
    previousTarget
  });

export function VisualIntervalMode({
  instrumentLabel,
  selectedStrings,
  tuning
}: VisualIntervalModeProps) {
  const [question, setQuestion] = useState<VisualIntervalQuestion>(() =>
    createQuestion(tuning, selectedStrings)
  );
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [stats, setStats] = useState<SessionStats>({
    totalQuestions: 0,
    correct: 0,
    incorrect: 0,
    currentStreak: 0
  });

  const cells = useMemo(
    () => getFretboardCells(tuning, START_FRET, END_FRET, selectedStrings, "sharps"),
    [selectedStrings, tuning]
  );

  useEffect(() => {
    setQuestion(createQuestion(tuning, selectedStrings));
    setAnswerResult(null);
  }, [selectedStrings, tuning]);

  const markers: FretboardMarker[] = [
    {
      stringNumber: question.root.stringNumber,
      fret: question.root.fret,
      type: "root"
    },
    {
      stringNumber: question.target.stringNumber,
      fret: question.target.fret,
      type: "target"
    }
  ];

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
    setQuestion(
      createQuestion(
        tuning,
        selectedStrings,
        {
          stringNumber: question.root.stringNumber,
          fret: question.root.fret
        },
        {
          stringNumber: question.target.stringNumber,
          fret: question.target.fret
        }
      )
    );
    setAnswerResult(null);
  };

  const feedbackStatus = answerResult
    ? answerResult.isCorrect
      ? "correct"
      : "incorrect"
    : "neutral";
  const feedbackMessage = answerResult
    ? `${answerResult.isCorrect ? "Correct" : "Incorrect"}. ${question.root.noteName} on string ${question.root.stringNumber}, fret ${question.root.fret} to ${question.target.noteName} on string ${question.target.stringNumber}, fret ${question.target.fret} is ${question.interval.label} (${question.interval.shortLabel}).`
    : "What is the interval from the root to the marked note?";

  return (
    <PracticeLayout
      title="Visual interval training"
      instructions="What is the interval from the root to the marked note?"
      instrumentLabel={instrumentLabel}
      tuning={tuning}
      stats={stats}
      practiceContent={
        <Fretboard
          tuning={tuning}
          cells={cells}
          selectedStrings={selectedStrings}
          startFret={START_FRET}
          endFret={END_FRET}
          markers={markers}
          disabled={answerResult !== null}
          showNoteNames={false}
          showStringNames
          showFretNumbers={false}
          highStringOnTop
        />
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
