import { useEffect, useMemo, useState } from "react";
import { Fretboard } from "../../components/fretboard/Fretboard";
import { FeedbackPanel } from "../../components/layout/FeedbackPanel";
import { PracticeLayout } from "../../components/layout/PracticeLayout";
import { getFretboardCells } from "../../music/fretboard";
import { SHARP_NOTE_NAMES, noteNameToPitchClass } from "../../music/notes";
import type { SessionStats } from "../../types/modes";
import type {
  FretboardMarker,
  FretboardPosition,
  StringNumber,
  Tuning
} from "../../types/music";
import {
  generateVisualNoteQuestion,
  type VisualNoteQuestion
} from "./generateVisualNoteQuestion";

type VisualNoteModeProps = {
  instrumentLabel: string;
  selectedStrings: readonly StringNumber[];
  tuning: Tuning;
};

type AnswerResult = {
  selectedNoteName: string;
  isCorrect: boolean;
};

const START_FRET = 0;
const END_FRET = 12;

const createQuestion = (
  tuning: Tuning,
  selectedStrings: readonly StringNumber[],
  previousPosition?: FretboardPosition
): VisualNoteQuestion =>
  generateVisualNoteQuestion({
    tuning,
    selectedStrings,
    startFret: START_FRET,
    endFret: END_FRET,
    previousPosition
  });

export function VisualNoteMode({
  instrumentLabel,
  selectedStrings,
  tuning
}: VisualNoteModeProps) {
  const [question, setQuestion] = useState<VisualNoteQuestion>(() =>
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
      stringNumber: question.position.stringNumber,
      fret: question.position.fret,
      type: answerResult
        ? answerResult.isCorrect
          ? "correct"
          : "incorrect"
        : "selected"
    }
  ];

  const handleAnswer = (noteName: string) => {
    if (answerResult) {
      return;
    }

    const isCorrect =
      noteNameToPitchClass(noteName) === question.position.pitchClass;

    setAnswerResult({ selectedNoteName: noteName, isCorrect });
    setStats((currentStats) => ({
      totalQuestions: currentStats.totalQuestions + 1,
      correct: currentStats.correct + (isCorrect ? 1 : 0),
      incorrect: currentStats.incorrect + (isCorrect ? 0 : 1),
      currentStreak: isCorrect ? currentStats.currentStreak + 1 : 0
    }));
  };

  const handleNextQuestion = () => {
    setQuestion(
      createQuestion(tuning, selectedStrings, {
        stringNumber: question.position.stringNumber,
        fret: question.position.fret
      })
    );
    setAnswerResult(null);
  };

  const feedbackStatus = answerResult
    ? answerResult.isCorrect
      ? "correct"
      : "incorrect"
    : "neutral";
  const feedbackMessage = answerResult
    ? `${answerResult.isCorrect ? "Correct" : "Incorrect"}. The marked note is ${question.answerNoteName} on string ${question.position.stringNumber}, fret ${question.position.fret}.`
    : "What note is marked?";

  return (
    <PracticeLayout
      title="Visual note training"
      instructions="What note is marked?"
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
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
            {SHARP_NOTE_NAMES.map((noteName) => {
              const isSelected = answerResult?.selectedNoteName === noteName;

              return (
                <button
                  className={`h-10 rounded border bg-white text-sm font-medium transition disabled:cursor-not-allowed ${
                    isSelected
                      ? "border-emerald-600 text-emerald-700"
                      : "border-slate-300 text-slate-800 hover:border-emerald-500 hover:text-emerald-700"
                  }`}
                  disabled={answerResult !== null}
                  key={noteName}
                  type="button"
                  onClick={() => handleAnswer(noteName)}
                >
                  {noteName}
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
