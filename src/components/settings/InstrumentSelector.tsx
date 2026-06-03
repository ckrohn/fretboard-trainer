import type { InstrumentType } from "../../types/music";
import { useSettings } from "../../state/settingsStore";

const OPTIONS: Array<{ instrumentType: InstrumentType; label: string }> = [
  { instrumentType: "sixStringGuitar", label: "6-string guitar, standard tuning" },
  { instrumentType: "sevenStringGuitar", label: "7-string guitar, standard tuning" }
];

export function InstrumentSelector() {
  const { settings, setInstrumentType } = useSettings();

  return (
    <label className="flex flex-col gap-2 rounded border border-slate-200 bg-white p-4">
      <span className="text-sm font-medium text-slate-700">Instrument and tuning</span>
      <select
        className="h-11 rounded border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        value={settings.instrumentType}
        onChange={(event) => setInstrumentType(event.target.value as InstrumentType)}
      >
        {OPTIONS.map((option) => (
          <option key={option.instrumentType} value={option.instrumentType}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
