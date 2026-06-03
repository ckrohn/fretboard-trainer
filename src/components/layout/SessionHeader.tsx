import type { SessionStats } from "../../types/modes";

type SessionHeaderProps = {
  stats: SessionStats;
};

export function SessionHeader({ stats }: SessionHeaderProps) {
  const items = [
    { label: "Questions", value: stats.totalQuestions },
    { label: "Correct", value: stats.correct },
    { label: "Incorrect", value: stats.incorrect },
    { label: "Streak", value: stats.currentStreak }
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Session stats">
      {items.map((item) => (
        <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2" key={item.label}>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {item.label}
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-950">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
