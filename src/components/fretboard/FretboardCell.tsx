import type { FretboardCellData } from "../../types/music";

type FretboardCellProps = {
  cell: FretboardCellData;
  stringThickness: string;
};

export function FretboardCell({ cell, stringThickness }: FretboardCellProps) {
  const isOpenString = cell.fret === 0;

  return (
    <button
      className={`relative flex h-12 items-center justify-center border-r border-stone-300 text-xs font-semibold transition hover:bg-emerald-400/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-200 ${
        isOpenString ? "bg-stone-950/90 text-amber-50" : "text-amber-50"
      }`}
      type="button"
      aria-label={`String ${cell.stringNumber}, fret ${cell.fret}, ${cell.noteName}`}
    >
      <span
        className="absolute left-0 right-0 top-1/2 bg-slate-200 shadow-sm"
        style={{ height: stringThickness, transform: "translateY(-50%)" }}
      />
      <span className="relative z-10 rounded bg-stone-950/75 px-1.5 py-0.5 leading-none">
        {cell.noteName}
      </span>
    </button>
  );
}
