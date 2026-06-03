import { getStringNumbersForTuning } from "../../music/instruments";
import { useSettings } from "../../state/settingsStore";

export function StringSelector() {
  const { activeTuning, settings, toggleString } = useSettings();
  const stringNumbers = getStringNumbersForTuning(activeTuning);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">Selected strings</span>
      <div className="flex flex-wrap gap-2">
        {stringNumbers.map((stringNumber) => {
          const isSelected = settings.selectedStrings.includes(stringNumber);

          return (
            <button
              className={`h-9 rounded border px-3 text-sm font-medium transition ${
                isSelected
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-emerald-500"
              }`}
              key={stringNumber}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleString(stringNumber)}
            >
              {stringNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}
