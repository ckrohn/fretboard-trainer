import { useEffect, useMemo, useState } from "react";
import { Fretboard } from "../../components/fretboard/Fretboard";
import { FeedbackPanel } from "../../components/layout/FeedbackPanel";
import { PracticeLayout } from "../../components/layout/PracticeLayout";
import { getFretboardCells } from "../../music/fretboard";
import { FLAT_NOTE_NAMES, SHARP_NOTE_NAMES, noteNameToPitchClass } from "../../music/notes";
import { shortcutLabelForIndex } from "../../utils/keyboard";
import { useAnswerShortcuts } from "../../utils/useAnswerShortcuts";
import { useProgress } from "../../state/progressStore";
import { useSettings } from "../../state/settingsStore";
import type { SessionStats } from "../../types/modes";
import type {
  AccidentalPreference,
  FretboardMarker,
  FretboardPosition,
  StringNumber,
  Tuning
} from "../../types/music";
import {
  generateVisualNoteQuestion,
  type VisualNoteQuestion
} from "./generateVisualNoteQuestion";

type AnswerResult = {
  selectedNoteName: string;
  isCorrect: boolean;
};

const createQuestion = (
  tuning: Tuning,
  selectedStrings: readonly StringNumber[],
  startFret: number,
  endFret: number,
  accidentalPreference: AccidentalPreference,
  previousPosition?: FretboardPosition
): VisualNoteQuestion =>
  generateVisualNoteQuestion({
    tuning,
    selectedStrings,
    startFret,
    endFret,
    previousPosition,
    accidentalPreference
  });

export function VisualNoteMode() {
  const { activeTuning: tuning, settings } = useSettings();
  const { recordProgress } = useProgress();
  const instrumentLabel = settings.instrumentType === "sevenStringGuitar" ? "7-string guitar" : "6-string guitar";
  const selectedStrings = settings.selectedStrings;
  const answerNoteNames = settings.accidentalPreference === "flats" ? FLAT_NOTE_NAMES : SHARP_NOTE_NAMES;
  const [question, setQuestion] = useState<VisualNoteQuestion>(() =>
    createQuestion(tuning, selectedStrings, settings.startFret, settings.endFret, settings.accidentalPreference)
  );
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const [stats, setStats] = useState<SessionStats>({
    totalQuestions: 0,
    correct: 0,
    incorrect: 0,
    currentStreak: 0
  });

  const cells = useMemo(
    () => getFretboardCells(tuning, settings.startFret, settings.endFret, selectedStrings, settings.accidentalPreference),
    [selectedStrings, tuning, settings.startFret, settings.endFret, settings.accidentalPreference]
  );

  useEffect(() => {
    setQuestion(createQuestion(tuning, selectedStrings, settings.startFret, settings.endFret, settings.accidentalPreference));
    setAnswerResult(null);
    setAutoAdvanceCountdown(null);
  }, [selectedStrings, tuning, settings.startFret, settings.endFret, settings.accidentalPreference]);

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

    recordProgress({
      isCorrect,
      instrumentType: settings.instrumentType,
      tuningId: settings.tuningId,
      noteName: question.answerNoteName,
      stringNumber: question.position.stringNumber
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

    setAnswerResult({ selectedNoteName: noteName, isCorrect });
    setAutoAdvanceCountdown(3);
  };

  const handleNextQuestion = () => {
    setQuestion(
      createQuestion(tuning, selectedStrings, settings.startFret, settings.endFret, settings.accidentalPreference, {
        stringNumber: question.position.stringNumber,
        fret: question.position.fret
      })
    );
    setAnswerResult(null);
    setAutoAdvanceCountdown(null);
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
    answerCount: answerNoteNames.length,
    canAnswer: answerResult === null,
    canGoNext: answerResult !== null,
    onAnswer: (index) => handleAnswer(answerNoteNames[index]),
    onNext: handleNextQuestion
  });

  const feedbackStatus = answerResult
    ? answerResult.isCorrect
      ? "correct"
      : "incorrect"
    : "neutral";
  const feedbackMessage = answerResult
    ? `${answerResult.isCorrect ? "Correct" : "Incorrect"}. The marked note is ${question.answerNoteName} on string ${question.position.stringNumber}, fret ${question.position.fret}.${answerResult.isCorrect || autoAdvanceCountdown === null ? "" : ` Next question in ${autoAdvanceCountdown}.`}`
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
          startFret={settings.startFret}
          endFret={settings.endFret}
          markers={markers}
          disabled={answerResult !== null}
          showNoteNames={false}
          showStringNames={settings.showStringNames}
          showFretNumbers={settings.showFretNumbers}
          highStringOnTop={settings.highStringOnTop}
        />
      }
      answerArea={
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
            {answerNoteNames.map((noteName, index) => {
              const isSelected = answerResult?.selectedNoteName === noteName;
              const isCorrectAnswer = noteNameToPitchClass(noteName) === question.position.pitchClass;
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
                  key={noteName}
                  type="button"
                  onClick={(event) => {
                    event.currentTarget.blur();
                    handleAnswer(noteName);
                  }}
                >
                  <span>{noteName}</span>
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
