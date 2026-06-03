import { PRACTICE_MODES } from "../../modes";
import type { PracticeModeId } from "../../types/modes";

type ModeSelectorProps = {
  modeId: PracticeModeId;
  onModeChange: (modeId: PracticeModeId) => void;
};

export function ModeSelector({ modeId, onModeChange }: ModeSelectorProps) {
  return (
    <label className="flex flex-col gap-2 rounded border border-slate-200 bg-white p-4">
      <span className="text-sm font-medium text-slate-700">Practice mode</span>
      <select
        className="h-11 rounded border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        value={modeId}
        onChange={(event) => onModeChange(event.target.value as PracticeModeId)}
      >
        {PRACTICE_MODES.map((mode) => (
          <option key={mode.id} value={mode.id}>
            {mode.label}
          </option>
        ))}
      </select>
    </label>
  );
}
