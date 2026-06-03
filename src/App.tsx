import { useState } from "react";
import { ModeSelector } from "./components/ModeSelector";
import { InstrumentSelector } from "./components/settings/InstrumentSelector";
import { getDefaultTuningForInstrument, getStringNumbersForTuning } from "./music/instruments";
import { ALL_TUNINGS, getTuningById } from "./music/tunings";
import { FindNotesMode } from "./modes/findNotes/FindNotesMode";
import { IntervalListeningMode } from "./modes/intervalListening/IntervalListeningMode";
import { VisualIntervalMode } from "./modes/visualInterval/VisualIntervalMode";
import { VisualNoteMode } from "./modes/visualNote/VisualNoteMode";
import { DEFAULT_SETTINGS } from "./state/settingsStore";
import type { InstrumentType, StringNumber, Tuning } from "./types/music";
import type { PracticeModeId } from "./types/modes";

const getInstrumentLabel = (instrumentType: InstrumentType): string =>
  instrumentType === "sevenStringGuitar" ? "7-string guitar" : "6-string guitar";

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

  const handleTuningChange = (tuningId: string) => {
    const nextTuning = getTuningById(tuningId);
    setActiveTuning(nextTuning);
    setInstrumentType(nextTuning.instrumentType);
    setSelectedStrings(getStringNumbersForTuning(nextTuning));
  };

  const instrumentLabel = getInstrumentLabel(instrumentType);

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
            instrumentLabel={instrumentLabel}
            selectedStrings={selectedStrings}
            tuning={activeTuning}
          />
        ) : modeId === "visualInterval" ? (
          <VisualIntervalMode
            instrumentLabel={instrumentLabel}
            selectedStrings={selectedStrings}
            tuning={activeTuning}
          />
        ) : modeId === "findNotes" ? (
          <FindNotesMode
            instrumentLabel={instrumentLabel}
            selectedStrings={selectedStrings}
            tuning={activeTuning}
          />
        ) : (
          <IntervalListeningMode instrumentLabel={instrumentLabel} tuning={activeTuning} />
        )}
      </div>
    </main>
  );
}
