import { SIMPLE_INTERVALS } from "../../music/intervals";

export function IntervalAnswerPanel() {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-800">Interval answers</h3>
      <div className="mt-3 grid grid-cols-3 gap-2">
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
