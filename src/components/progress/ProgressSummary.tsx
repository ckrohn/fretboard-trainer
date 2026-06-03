import { SIMPLE_INTERVALS } from "../../music/intervals";
import { SHARP_NOTE_NAMES } from "../../music/notes";
import { ALL_TUNINGS } from "../../music/tunings";
import { useProgress } from "../../state/progressStore";

type SummaryRow = {
  id: string;
  label: string;
  attempts: number;
  correct: number;
};

type StringSummaryRow = SummaryRow & {
  instrument: string;
  tuning: string;
  stringNumber: string;
};

const instrumentLabels: Record<string, string> = {
  sixStringGuitar: "6-string guitar",
  sevenStringGuitar: "7-string guitar"
};

const formatAccuracy = (attempts: number, correct: number): string =>
  attempts === 0 ? "0%" : `${Math.round((correct / attempts) * 100)}%`;

const accuracyValue = (row: Pick<SummaryRow, "attempts" | "correct">): number =>
  row.attempts === 0 ? 0 : row.correct / row.attempts;

const weakRows = <T extends SummaryRow>(rows: T[]): T[] =>
  rows
    .filter((row) => row.attempts >= 5)
    .sort((a, b) => accuracyValue(a) - accuracyValue(b) || b.attempts - a.attempts)
    .slice(0, 5);

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function AccuracyTable({ title, rows }: { title: string; rows: SummaryRow[] }) {
  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Item</th>
              <th className="px-4 py-2">Attempts</th>
              <th className="px-4 py-2">Correct</th>
              <th className="px-4 py-2">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-t border-slate-100" key={row.id}>
                <td className="px-4 py-2 font-medium text-slate-900">{row.label}</td>
                <td className="px-4 py-2 text-slate-700">{row.attempts}</td>
                <td className="px-4 py-2 text-slate-700">{row.correct}</td>
                <td className="px-4 py-2 text-slate-700">{formatAccuracy(row.attempts, row.correct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StringAccuracyTable({ rows }: { rows: StringSummaryRow[] }) {
  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
        String accuracy
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Instrument</th>
              <th className="px-4 py-2">Tuning</th>
              <th className="px-4 py-2">String</th>
              <th className="px-4 py-2">Attempts</th>
              <th className="px-4 py-2">Correct</th>
              <th className="px-4 py-2">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-t border-slate-100" key={row.id}>
                <td className="px-4 py-2 text-slate-700">{row.instrument}</td>
                <td className="px-4 py-2 text-slate-700">{row.tuning}</td>
                <td className="px-4 py-2 font-medium text-slate-900">{row.stringNumber}</td>
                <td className="px-4 py-2 text-slate-700">{row.attempts}</td>
                <td className="px-4 py-2 text-slate-700">{row.correct}</td>
                <td className="px-4 py-2 text-slate-700">{formatAccuracy(row.attempts, row.correct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WeakList({ title, rows }: { title: string; rows: SummaryRow[] }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">No items with at least 5 attempts.</p>
      ) : (
        <ul className="mt-2 space-y-2 text-sm text-slate-700">
          {rows.map((row) => (
            <li className="flex justify-between gap-3" key={row.id}>
              <span>{row.label}</span>
              <span>{formatAccuracy(row.attempts, row.correct)} ({row.correct}/{row.attempts})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ProgressSummary() {
  const { progress, resetProgress } = useProgress();
  const instrumentRows: SummaryRow[] = ["sixStringGuitar", "sevenStringGuitar"].map((id) => {
    const bucket = progress.perInstrument[id] ?? { attempts: 0, correct: 0 };

    return {
      id,
      label: instrumentLabels[id],
      attempts: bucket.attempts,
      correct: bucket.correct
    };
  });
  const tuningRows: SummaryRow[] = ALL_TUNINGS.map((tuning) => {
    const bucket = progress.perTuning[tuning.id] ?? { attempts: 0, correct: 0 };

    return {
      id: tuning.id,
      label: tuning.id,
      attempts: bucket.attempts,
      correct: bucket.correct
    };
  });
  const intervalRows: SummaryRow[] = SIMPLE_INTERVALS.map((interval) => {
    const bucket = progress.perInterval[interval.id] ?? { attempts: 0, correct: 0 };

    return {
      id: interval.id,
      label: `${interval.shortLabel} - ${interval.label}`,
      attempts: bucket.attempts,
      correct: bucket.correct
    };
  });
  const noteRows: SummaryRow[] = SHARP_NOTE_NAMES.map((noteName) => {
    const bucket = progress.perNote[noteName] ?? { attempts: 0, correct: 0 };

    return {
      id: noteName,
      label: noteName,
      attempts: bucket.attempts,
      correct: bucket.correct
    };
  });
  const stringRows: StringSummaryRow[] = Object.entries(progress.perString)
    .map(([key, bucket]) => {
      const [instrumentType = "unknown", tuningId = "unknown", stringNumber = key] = key.split("|");

      return {
        id: key,
        label: `String ${stringNumber}`,
        instrument: instrumentLabels[instrumentType] ?? instrumentType,
        tuning: tuningId,
        stringNumber,
        attempts: bucket.attempts,
        correct: bucket.correct
      };
    })
    .sort((a, b) =>
      a.tuning === b.tuning
        ? Number(a.stringNumber) - Number(b.stringNumber)
        : a.tuning.localeCompare(b.tuning)
    );

  const handleResetProgress = () => {
    if (window.confirm("Reset all lifetime progress?")) {
      resetProgress();
    }
  };

  return (
    <section className="flex flex-col gap-5 rounded border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Progress summary</h2>
          <p className="text-sm text-slate-600">Lifetime progress saved in this browser.</p>
        </div>
        <button
          className="h-10 rounded border border-red-300 bg-white px-4 text-sm font-medium text-red-700 transition hover:border-red-500 hover:text-red-800"
          type="button"
          onClick={handleResetProgress}
        >
          Reset progress
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total attempts" value={progress.totalAttempts} />
        <MetricCard label="Correct attempts" value={progress.correctAttempts} />
        <MetricCard
          label="Accuracy"
          value={formatAccuracy(progress.totalAttempts, progress.correctAttempts)}
        />
        <MetricCard label="Best streak" value={progress.bestStreak} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AccuracyTable title="Instrument accuracy" rows={instrumentRows} />
        <AccuracyTable title="Tuning accuracy" rows={tuningRows} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <WeakList title="Weak intervals" rows={weakRows(intervalRows)} />
        <WeakList title="Weak notes" rows={weakRows(noteRows)} />
        <WeakList title="Weak strings" rows={weakRows(stringRows)} />
      </div>

      <AccuracyTable title="Interval accuracy" rows={intervalRows} />
      <AccuracyTable title="Note accuracy" rows={noteRows} />
      <StringAccuracyTable rows={stringRows} />
    </section>
  );
}
