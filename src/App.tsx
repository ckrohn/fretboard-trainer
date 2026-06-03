import { useMemo, useState } from "react";
import { AnswerPanel } from "./components/answers/AnswerPanel";
import { Fretboard } from "./components/fretboard/Fretboard";
import { PracticeLayout } from "./components/layout/PracticeLayout";
import { FeedbackPanel } from "./components/layout/FeedbackPanel";
import { ModeSelector } from "./components/ModeSelector";
import { InstrumentSelector } from "./components/settings/InstrumentSelector";
import { getFretboardCells } from "./music/fretboard";
import { getDefaultTuningForInstrument, getStringNumbersForTuning } from "./music/instruments";
import { ALL_TUNINGS, getTuningById } from "./music/tunings";
import { PRACTICE_MODES } from "./modes";
import { FindNotesMode } from "./modes/findNotes/FindNotesMode";
import { VisualIntervalMode } from "./modes/visualInterval/VisualIntervalMode";
import { VisualNoteMode } from "./modes/visualNote/VisualNoteMode";
import { DEFAULT_SETTINGS } from "./state/settingsStore";
import type { FretboardMarker, InstrumentType, StringNumber, Tuning } from "./types/music";
import type { FeedbackStatus, PracticeModeId, SessionStats } from "./types/modes";

const SAMPLE_MARKERS: FretboardMarker[] = [
  { stringNumber: 6, fret: 3, type: "root" },
  { stringNumber: 5, fret: 5, type: "target" },
  { stringNumber: 3, fret: 7, type: "selected" },
  { stringNumber: 2, fret: 8, type: "correct" },
  { stringNumber: 1, fret: 10, type: "incorrect" },
  { stringNumber: 4, fret: 12, type: "missed" },
  { stringNumber: 7, fret: 1, type: "selected" }
];

const MODE_FEEDBACK: Record<PracticeModeId, { status: FeedbackStatus; message: string }> = {
  visualNote: {
    status: "neutral",
    message: "Choose a note name to answer the highlighted position."
  },
  visualInterval: {
    status: "neutral",
    message: "Choose the interval between the root and target markers."
  },
  findNotes: {
    status: "neutral",
    message: "Placeholder mode: select all matching notes when generation is added."
  },
  intervalListening: {
    status: "neutral",
    message: "Placeholder mode: audio playback will be added later."
  }
};

const SESSION_STATS: SessionStats = {
  totalQuestions: 0,
  correct: 0,
  incorrect: 0,
  currentStreak: 0
};

const getInstrumentLabel = (instrumentType: InstrumentType): string =>
  instrumentType === "sevenStringGuitar" ? "7-string guitar" : "6-string guitar";

const getPracticeMarkers = (
  modeId: PracticeModeId,
  selectedStrings: readonly StringNumber[]
): FretboardMarker[] => {
  if (modeId === "intervalListening") {
    return [];
  }

  if (modeId === "visualNote") {
    return SAMPLE_MARKERS.filter((marker) => marker.type === "root");
  }

  return SAMPLE_MARKERS.filter((marker) => selectedStrings.includes(marker.stringNumber));
};

export default function App() {
  const initialTuning = getDefaultTuningForInstrument(DEFAULT_SETTINGS.instrumentType);
  const [modeId, setModeId] = useState<PracticeModeId>(DEFAULT_SETTINGS.modeId);
  const [instrumentType, setInstrumentType] = useState<InstrumentType>(
    initialTuning.instrumentType
  );
  const [activeTuning, setActiveTuning] = useState<Tuning>(initialTuning);
  const [selectedStrings, setSelectedStrings] = useState<StringNumber[]>(
    getStringNumbersForTuning(initialTuning)
  );

  const activeMode = PRACTICE_MODES.find((mode) => mode.id === modeId);
  const activeCells = useMemo(
    () => getFretboardCells(activeTuning, 0, 12, selectedStrings, "sharps"),
    [activeTuning, selectedStrings]
  );

  const handleTuningChange = (tuningId: string) => {
    const nextTuning = getTuningById(tuningId);
    setActiveTuning(nextTuning);
    setInstrumentType(nextTuning.instrumentType);
    setSelectedStrings(getStringNumbersForTuning(nextTuning));
  };

  const practiceContent =
    modeId === "intervalListening" ? (
      <div className="flex min-h-[18rem] items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
        Interval listening practice will use Web Audio controls here.
      </div>
    ) : (
      <Fretboard
        tuning={activeTuning}
        cells={activeCells}
        selectedStrings={selectedStrings}
        startFret={0}
        endFret={12}
        markers={getPracticeMarkers(modeId, selectedStrings)}
        showNoteNames={modeId === "findNotes"}
        showStringNames
        showFretNumbers={false}
        highStringOnTop
        onCellClick={(cell) => console.info("Fretboard cell", cell)}
      />
    );

  const feedback = MODE_FEEDBACK[modeId];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-6 px-3 py-6 sm:px-5 lg:px-6">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
              Browser-only practice
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Guitar Fretboard Trainer
            </h1>
          </div>
          <div className="text-sm text-slate-600">
            Active tuning: <span className="font-medium text-slate-900">{activeTuning.label}</span>
          </div>
        </header>

        <InstrumentSelector
          activeTuningId={activeTuning.id}
          tunings={ALL_TUNINGS}
          onTuningChange={handleTuningChange}
        />

        <ModeSelector modeId={modeId} onModeChange={setModeId} />

        {modeId === "visualNote" ? (
          <VisualNoteMode
            instrumentLabel={getInstrumentLabel(instrumentType)}
            selectedStrings={selectedStrings}
            tuning={activeTuning}
          />
        ) : modeId === "visualInterval" ? (
          <VisualIntervalMode
            instrumentLabel={getInstrumentLabel(instrumentType)}
            selectedStrings={selectedStrings}
            tuning={activeTuning}
          />
        ) : modeId === "findNotes" ? (
          <FindNotesMode
            instrumentLabel={getInstrumentLabel(instrumentType)}
            selectedStrings={selectedStrings}
            tuning={activeTuning}
          />
        ) : (
          <PracticeLayout
            title={activeMode?.label ?? "Practice"}
            instructions={activeMode?.instructions ?? "Select a practice mode."}
            instrumentLabel={getInstrumentLabel(instrumentType)}
            tuning={activeTuning}
            stats={SESSION_STATS}
            practiceContent={practiceContent}
            answerArea={<AnswerPanel modeId={modeId} />}
            feedbackArea={<FeedbackPanel status={feedback.status} message={feedback.message} />}
          />
        )}
      </div>
    </main>
  );
}
