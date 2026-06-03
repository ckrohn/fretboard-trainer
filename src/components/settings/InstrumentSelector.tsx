import { INSTRUMENT_OPTIONS } from "../../music/instruments";
import type { InstrumentType } from "../../types/music";

type InstrumentSelectorProps = {
  instrumentType: InstrumentType;
  onInstrumentTypeChange: (instrumentType: InstrumentType) => void;
};

export function InstrumentSelector({
  instrumentType,
  onInstrumentTypeChange
}: InstrumentSelectorProps) {
  return (
    <label className="flex flex-col gap-2 rounded border border-slate-200 bg-white p-4">
      <span className="text-sm font-medium text-slate-700">Instrument</span>
      <select
        className="h-11 rounded border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        value={instrumentType}
        onChange={(event) =>
          onInstrumentTypeChange(event.target.value as InstrumentType)
        }
      >
        {INSTRUMENT_OPTIONS.map((instrument) => (
          <option key={instrument.type} value={instrument.type}>
            {instrument.label}
          </option>
        ))}
      </select>
    </label>
  );
}
