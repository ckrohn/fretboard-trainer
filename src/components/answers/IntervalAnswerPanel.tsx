import { SIMPLE_INTERVALS } from "../../music/intervals";

export function IntervalAnswerPanel() {
  return (
    <div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-13">
        {SIMPLE_INTERVALS.map((interval) => (
          <button
            className="h-10 rounded border border-slate-300 bg-white text-sm font-medium text-slate-800 transition hover:border-emerald-500 hover:text-emerald-700"
            key={interval.id}
            type="button"
          >
            {interval.shortLabel}
          </button>
        ))}
      </div>
    </div>
  );
}
