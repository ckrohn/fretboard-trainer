import type { ReactNode } from "react";

type PracticeLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function PracticeLayout({
  title,
  description,
  children
}: PracticeLayoutProps) {
  return (
    <section className="flex flex-col gap-4 rounded border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
