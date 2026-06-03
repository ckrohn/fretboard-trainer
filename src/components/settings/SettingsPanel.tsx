import { useState } from "react";
import { SIMPLE_INTERVALS } from "../../music/intervals";
import { useSettings } from "../../state/settingsStore";
import type { PracticeModeId } from "../../types/modes";
import { InstrumentSelector } from "./InstrumentSelector";
import { StringSelector } from "./StringSelector";

type TrainingSettingsPanelProps = {
  modeId: PracticeModeId;
};

const usesFretboard = (modeId: PracticeModeId): boolean =>
  modeId === "visualNote" || modeId === "visualInterval" || modeId === "findNotes";

const usesAllowedIntervals = (modeId: PracticeModeId): boolean =>
  modeId === "visualInterval" || modeId === "intervalListening";

export function SettingsPanel() {
  return (
    <section className="flex flex-col gap-4 rounded border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Settings</h2>
        <p className="text-sm text-slate-600">General app configuration</p>
      </div>
      <InstrumentSelector />
    </section>
  );
}

export function TrainingSettingsPanel({ modeId }: TrainingSettingsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { settings, setFretRange, setSetting, toggleAllowedInterval } = useSettings();
  const shouldShowFretboardSettings = usesFretboard(modeId);
  const shouldShowNoteNames = modeId === "visualInterval";
  const shouldShowListeningPlayback = modeId === "intervalListening";
  const shouldShowAllowedIntervals = usesAllowedIntervals(modeId);
  const hasTrainingSettings =
    shouldShowFretboardSettings || shouldShowListeningPlayback || shouldShowAllowedIntervals;

  if (!hasTrainingSettings) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4 rounded border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Training settings</h2>
          <p className="text-sm text-slate-600">Options for the selected training mode</p>
        </div>
        <button
          className="h-9 rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 transition hover:border-emerald-500 hover:text-emerald-700"
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {isExpanded && shouldShowFretboardSettings ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="grid gap-3 rounded border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Start fret</span>
              <input
                className="h-10 rounded border border-slate-300 px-3"
                min={0}
                type="number"
                value={settings.startFret}
                onChange={(event) => setFretRange(Number(event.target.value), settings.endFret)}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">End fret</span>
              <input
                className="h-10 rounded border border-slate-300 px-3"
                min={settings.startFret}
                type="number"
                value={settings.endFret}
                onChange={(event) => setFretRange(settings.startFret, Number(event.target.value))}
              />
            </label>
          </div>
          <div className="rounded border border-slate-200 bg-slate-50 p-4">
            <StringSelector />
          </div>
        </div>
      ) : null}

      {isExpanded && shouldShowFretboardSettings ? (
        <div className="grid gap-3 rounded border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Accidentals</span>
            <select
              className="h-10 rounded border border-slate-300 bg-white px-3"
              value={settings.accidentalPreference}
              onChange={(event) =>
                setSetting("accidentalPreference", event.target.value as typeof settings.accidentalPreference)
              }
            >
              <option value="sharps">Sharps</option>
              <option value="flats">Flats</option>
            </select>
          </label>
          {shouldShowNoteNames ? (
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                checked={settings.showNoteNames}
                type="checkbox"
                onChange={(event) => setSetting("showNoteNames", event.target.checked)}
              />
              Show note names
            </label>
          ) : null}
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              checked={settings.showStringNames}
              type="checkbox"
              onChange={(event) => setSetting("showStringNames", event.target.checked)}
            />
            Show string names
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              checked={settings.showFretNumbers}
              type="checkbox"
              onChange={(event) => setSetting("showFretNumbers", event.target.checked)}
            />
            Show fret numbers
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              checked={settings.highStringOnTop}
              type="checkbox"
              onChange={(event) => setSetting("highStringOnTop", event.target.checked)}
            />
            High string on top
          </label>
        </div>
      ) : null}

      {isExpanded && shouldShowListeningPlayback ? (
        <div className="rounded border border-slate-200 bg-slate-50 p-4">
          <label className="flex max-w-sm flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Listening playback</span>
            <select
              className="h-10 rounded border border-slate-300 bg-white px-3"
              value={settings.listeningPlaybackMode}
              onChange={(event) =>
                setSetting("listeningPlaybackMode", event.target.value as typeof settings.listeningPlaybackMode)
              }
            >
              <option value="melodicAscending">Melodic ascending</option>
              <option value="harmonic">Harmonic</option>
            </select>
          </label>
        </div>
      ) : null}

      {isExpanded && shouldShowAllowedIntervals ? (
        <div className="rounded border border-slate-200 bg-slate-50 p-4">
          <span className="text-sm font-medium text-slate-700">Allowed intervals</span>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-[repeat(13,minmax(0,1fr))]">
            {SIMPLE_INTERVALS.map((interval) => {
              const isAllowed = settings.allowedIntervals.includes(interval.id);

              return (
                <button
                  className={`h-9 rounded border text-sm font-medium transition ${
                    isAllowed
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-emerald-500"
                  }`}
                  key={interval.id}
                  type="button"
                  aria-pressed={isAllowed}
                  onClick={() => toggleAllowedInterval(interval.id)}
                >
                  {interval.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
