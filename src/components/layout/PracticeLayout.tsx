import type { ReactNode } from "react";
import type { SessionStats } from "../../types/modes";
import type { Tuning } from "../../types/music";
import { FeedbackPanel } from "./FeedbackPanel";
import { SessionHeader } from "./SessionHeader";

type PracticeLayoutProps = {
  title: string;
  instructions: string;
  instrumentLabel: string;
  tuning: Tuning;
  stats: SessionStats;
  practiceContent: ReactNode;
  answerArea: ReactNode;
  feedbackArea: ReactNode;
};

export function PracticeLayout({
  title,
  instructions,
  instrumentLabel,
  tuning,
  stats,
  practiceContent,
  answerArea,
  feedbackArea
}: PracticeLayoutProps) {
  return (
    <section className="grid gap-4 rounded border border-slate-200 bg-white p-4 shadow-sm sm:p-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-3 rounded border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{instructions}</p>
            <p className="mt-2 text-sm text-slate-700">
              <span className="font-medium">{instrumentLabel}</span>
              <span className="mx-2 text-slate-400">/</span>
              <span>{tuning.label}</span>
            </p>
          </div>
          <div className="w-full lg:w-[28rem]">
            <SessionHeader stats={stats} />
          </div>
        </div>
        <div>{practiceContent}</div>
      </div>

      <aside className="flex min-w-0 flex-col gap-4">
        <div className="rounded border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-800">Answer</h3>
          <div className="mt-3">{answerArea}</div>
        </div>
        {feedbackArea}
      </aside>
    </section>
  );
}

export const DefaultFeedbackPanel = FeedbackPanel;
