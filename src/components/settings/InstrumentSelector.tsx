import type { Tuning } from "../../types/music";

type InstrumentSelectorProps = {
  activeTuningId: string;
  tunings: readonly Tuning[];
  onTuningChange: (tuningId: string) => void;
};

export function InstrumentSelector({
  activeTuningId,
  tunings,
  onTuningChange
}: InstrumentSelectorProps) {
  return (
    <label className="flex flex-col gap-2 rounded border border-slate-200 bg-white p-4">
      <span className="text-sm font-medium text-slate-700">Instrument and tuning</span>
      <select
        className="h-11 rounded border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        value={activeTuningId}
        onChange={(event) => onTuningChange(event.target.value)}
      >
        {tunings.map((tuning) => (
          <option key={tuning.id} value={tuning.id}>
            {tuning.instrumentType === "sevenStringGuitar"
              ? "7-string guitar, standard tuning"
              : "6-string guitar, standard tuning"}
          </option>
        ))}
      </select>
    </label>
  );
}
