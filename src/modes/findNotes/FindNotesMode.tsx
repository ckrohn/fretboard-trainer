import { useEffect, useMemo, useState } from "react";
import { Fretboard } from "../../components/fretboard/Fretboard";
import { FeedbackPanel } from "../../components/layout/FeedbackPanel";
import { PracticeLayout } from "../../components/layout/PracticeLayout";
import { getFretboardCells } from "../../music/fretboard";
import { isKeyboardInputTarget } from "../../utils/keyboard";
import { useProgress } from "../../state/progressStore";
import { useSettings } from "../../state/settingsStore";
import type { FeedbackStatus, SessionStats } from "../../types/modes";
import type {
  FretboardCellData,
  FretboardMarker,
  FretboardPosition,
  StringNumber,
  Tuning
} from "../../types/music";
import {
  evaluateFindNotesAnswer,
  type FindNotesEvaluation
} from "./evaluateFindNotesAnswer";
import {
  generateFindNotesQuestion,
  type FindNotesQuestion
} from "./generateFindNotesQuestion";

const positionKey = (position: FretboardPosition): string =>
  `${position.stringNumber}-${position.fret}`;

const toPosition = (cell: FretboardCellData): FretboardPosition => ({
  stringNumber: cell.stringNumber,
  fret: cell.fret
});

const positionsToMarkers = (
  positions: readonly FretboardPosition[],
  type: FretboardMarker["type"]
): FretboardMarker[] =>
  positions.map((position) => ({
    ...position,
    type
  }));

export function FindNotesMode() {
  const { activeTuning: tuning, settings } = useSettings();
  const { recordProgress } = useProgress();
  const instrumentLabel = settings.instrumentType === "sevenStringGuitar" ? "7-string guitar" : "6-string guitar";
  const selectedStrings = settings.selectedStrings;
  const [question, setQuestion] = useState<FindNotesQuestion>(() =>
    generateFindNotesQuestion(settings.accidentalPreference)
  );
  const [selectedPositions, setSelectedPositions] = useState<FretboardPosition[]>([]);
  const [evaluation, setEvaluation] = useState<FindNotesEvaluation | null>(null);
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
    setQuestion(generateFindNotesQuestion(settings.accidentalPreference));
    setSelectedPositions([]);
    setEvaluation(null);
    setAutoAdvanceCountdown(null);
  }, [selectedStrings, tuning, settings.startFret, settings.endFret, settings.accidentalPreference]);

  const selectedPositionKeys = new Set(selectedPositions.map(positionKey));
  const markers: FretboardMarker[] = evaluation
    ? [
        ...positionsToMarkers(evaluation.correctSelected, "correct"),
        ...positionsToMarkers(evaluation.missed, "missed"),
        ...positionsToMarkers(evaluation.wrongSelected, "incorrect")
      ]
    : positionsToMarkers(selectedPositions, "selected");

  const handleCellClick = (cell: FretboardCellData) => {
    if (evaluation) {
      return;
    }

    const position = toPosition(cell);
    const key = positionKey(position);

    setSelectedPositions((currentPositions) =>
      selectedPositionKeys.has(key)
        ? currentPositions.filter((currentPosition) => positionKey(currentPosition) !== key)
        : [...currentPositions, position]
    );
  };

  const handleSubmit = () => {
    if (evaluation) {
      return;
    }

    const nextEvaluation = evaluateFindNotesAnswer(
      cells,
      question.targetPitchClass,
      selectedPositions
    );

    recordProgress({
      isCorrect: nextEvaluation.isPerfect,
      instrumentType: settings.instrumentType,
      tuningId: settings.tuningId,
      noteName: question.targetNoteName,
      stringNumbers: selectedStrings
    });
    setStats((currentStats) => ({
      totalQuestions: currentStats.totalQuestions + 1,
      correct: currentStats.correct + (nextEvaluation.isPerfect ? 1 : 0),
      incorrect: currentStats.incorrect + (nextEvaluation.isPerfect ? 0 : 1),
      currentStreak: nextEvaluation.isPerfect ? currentStats.currentStreak + 1 : 0
    }));

    if (nextEvaluation.isPerfect) {
      handleNextQuestion();
      return;
    }

    setEvaluation(nextEvaluation);
    setAutoAdvanceCountdown(3);
  };

  const handleNextQuestion = () => {
    setQuestion(generateFindNotesQuestion(settings.accidentalPreference));
    setSelectedPositions([]);
    setEvaluation(null);
    setAutoAdvanceCountdown(null);
  };

  useEffect(() => {
    if (!evaluation || evaluation.isPerfect || autoAdvanceCountdown === null) {
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
  }, [evaluation, autoAdvanceCountdown, question]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isKeyboardInputTarget(event.target)) {
        return;
      }

      if (event.key === "Escape" && evaluation === null && selectedPositions.length > 0) {
        event.preventDefault();
        setSelectedPositions([]);
        return;
      }

      if (event.key === "Enter" && evaluation !== null) {
        event.preventDefault();
        handleNextQuestion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [evaluation, selectedPositions.length, question, settings.accidentalPreference]);

  const feedbackStatus: FeedbackStatus = evaluation
    ? evaluation.isPerfect
      ? "correct"
      : "incorrect"
    : "neutral";
  const feedbackMessage = evaluation
    ? evaluation.isPerfect
      ? `Correct. You found all ${question.targetNoteName} notes.`
      : `Not quite. Correct selected: ${evaluation.correctSelected.length}. Missed: ${evaluation.missed.length}. Wrong selected: ${evaluation.wrongSelected.length}.${autoAdvanceCountdown === null ? "" : ` Next question in ${autoAdvanceCountdown}.`}`
    : `Find all ${question.targetNoteName} notes.`;

  return (
    <PracticeLayout
      title="Find all notes"
      instructions={`Find all ${question.targetNoteName} notes`}
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
          disabled={evaluation !== null}
          showNoteNames={false}
          showStringNames={settings.showStringNames}
          showFretNumbers={settings.showFretNumbers}
          highStringOnTop={settings.highStringOnTop}
          onCellClick={handleCellClick}
        />
      }
      answerArea={
        <div className="flex flex-wrap gap-3">
          <button
            className="h-11 rounded border border-emerald-700 bg-emerald-700 px-4 text-sm font-medium text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={evaluation !== null}
            type="button"
            onClick={handleSubmit}
          >
            Submit answer
          </button>
          <button
            className="h-11 rounded border border-slate-300 bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={evaluation === null}
            type="button"
            onClick={handleNextQuestion}
          >
            Next question
            <span className="ml-2 text-xs opacity-70">Enter</span>
          </button>
        </div>
      }
      feedbackArea={<FeedbackPanel status={feedbackStatus} message={feedbackMessage} />}
    />
  );
}
