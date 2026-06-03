import { PRACTICE_MODES } from "../modes";
import type { PracticeModeId } from "../types/modes";

type ModeSelectorProps = {
  modeId: PracticeModeId;
  onModeChange: (modeId: PracticeModeId) => void;
};

export function ModeSelector({ modeId, onModeChange }: ModeSelectorProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Practice modes">
      {PRACTICE_MODES.map((mode) => {
        const isSelected = mode.id === modeId;

        return (
          <button
            className={`flex min-h-28 flex-col items-start justify-between rounded border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
              isSelected
                ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm"
                : "border-slate-200 bg-white text-slate-900 hover:border-emerald-400 hover:bg-emerald-50/50"
            }`}
            key={mode.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onModeChange(mode.id)}
          >
            <span className="text-base font-semibold">{mode.label}</span>
            <span className="mt-2 text-sm text-slate-600">{mode.description}</span>
          </button>
        );
      })}
    </section>
  );
}
