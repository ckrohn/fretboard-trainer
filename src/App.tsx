import { useState } from "react";
import { ModeSelector } from "./components/ModeSelector";
import { SettingsPanel, TrainingSettingsPanel } from "./components/settings/SettingsPanel";
import { useSettings } from "./state/settingsStore";
import { FindNotesMode } from "./modes/findNotes/FindNotesMode";
import { IntervalListeningMode } from "./modes/intervalListening/IntervalListeningMode";
import { VisualIntervalMode } from "./modes/visualInterval/VisualIntervalMode";
import { VisualNoteMode } from "./modes/visualNote/VisualNoteMode";
import type { PracticeModeId } from "./types/modes";

export default function App() {
  const [modeId, setModeId] = useState<PracticeModeId>("visualNote");
  const { activeTuning } = useSettings();

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

        <SettingsPanel />

        <ModeSelector modeId={modeId} onModeChange={setModeId} />

        <TrainingSettingsPanel modeId={modeId} />

        {modeId === "visualNote" ? (
          <VisualNoteMode />
        ) : modeId === "visualInterval" ? (
          <VisualIntervalMode />
        ) : modeId === "findNotes" ? (
          <FindNotesMode />
        ) : (
          <IntervalListeningMode />
        )}
      </div>
    </main>
  );
}
