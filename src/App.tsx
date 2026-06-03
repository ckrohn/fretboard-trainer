import { useMemo, useState } from "react";
import { AnswerPanel } from "./components/answers/AnswerPanel";
import { Fretboard } from "./components/fretboard/Fretboard";
import { PracticeLayout } from "./components/layout/PracticeLayout";
import { ModeSelector } from "./components/settings/ModeSelector";
import { InstrumentSelector } from "./components/settings/InstrumentSelector";
import { getDefaultTuningForInstrument } from "./music/instruments";
import { PRACTICE_MODES } from "./modes";
import { DEFAULT_SETTINGS } from "./state/settingsStore";
import type { InstrumentType } from "./types/music";
import type { PracticeModeId } from "./types/modes";

export default function App() {
  const [instrumentType, setInstrumentType] = useState<InstrumentType>(
    DEFAULT_SETTINGS.instrumentType
  );
  const [modeId, setModeId] = useState<PracticeModeId>(DEFAULT_SETTINGS.modeId);

  const activeTuning = useMemo(
    () => getDefaultTuningForInstrument(instrumentType),
    [instrumentType]
  );

  const activeMode = PRACTICE_MODES.find((mode) => mode.id === modeId);

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
            Active tuning:{" "}
            <span className="font-medium text-slate-900">{activeTuning.label}</span>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <InstrumentSelector
            instrumentType={instrumentType}
            onInstrumentTypeChange={setInstrumentType}
          />
          <ModeSelector modeId={modeId} onModeChange={setModeId} />
        </section>

        <PracticeLayout
          title={activeMode?.label ?? "Practice"}
          description={activeMode?.description ?? "Select a practice mode."}
        >
          <Fretboard
            tuning={activeTuning}
            fretStart={DEFAULT_SETTINGS.fretStart}
            fretEnd={DEFAULT_SETTINGS.fretEnd}
          />
          <AnswerPanel modeId={modeId} />
        </PracticeLayout>
      </div>
    </main>
  );
}
