import type { FeedbackStatus } from "../../types/modes";

type FeedbackPanelProps = {
  status: FeedbackStatus;
  message: string;
};

const statusClasses: Record<FeedbackStatus, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  correct: "border-emerald-200 bg-emerald-50 text-emerald-800",
  incorrect: "border-red-200 bg-red-50 text-red-800"
};

export function FeedbackPanel({ status, message }: FeedbackPanelProps) {
  return (
    <div className={`rounded border p-3 text-sm ${statusClasses[status]}`} role="status">
      {message}
    </div>
  );
}
