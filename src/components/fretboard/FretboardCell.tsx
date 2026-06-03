import type { FretboardCellData, FretboardMarker } from "../../types/music";

type FretboardCellProps = {
  cell: FretboardCellData;
  disabled: boolean;
  marker?: FretboardMarker;
  onCellClick?: (cell: FretboardCellData) => void;
  openNoteName: string;
  showNoteNames: boolean;
  showStringNames: boolean;
  stringThickness: string;
};

const markerClasses: Record<FretboardMarker["type"], string> = {
  root: "bg-sky-500 text-white ring-sky-100",
  target: "bg-violet-500 text-white ring-violet-100",
  selected: "bg-amber-300 text-stone-950 ring-amber-100",
  correct: "bg-emerald-500 text-white ring-emerald-100",
  incorrect: "bg-red-500 text-white ring-red-100",
  missed: "bg-slate-300 text-slate-950 ring-slate-100"
};

const markerLabels: Record<FretboardMarker["type"], string> = {
  root: "R",
  target: "?",
  selected: "S",
  correct: "C",
  incorrect: "I",
  missed: "M"
};

export function FretboardCell({
  cell,
  disabled,
  marker,
  onCellClick,
  openNoteName,
  showNoteNames,
  showStringNames,
  stringThickness
}: FretboardCellProps) {
  const isOpenString = cell.fret === 0;
  const labelParts = [`String ${cell.stringNumber}`, `fret ${cell.fret}`];

  if (showNoteNames || (showStringNames && isOpenString)) {
    labelParts.push(`note ${cell.noteName}`);
  }

  const visibleLabel = isOpenString && showStringNames ? openNoteName : cell.noteName;
  const shouldShowLabel = showNoteNames || (isOpenString && showStringNames) || marker;

  return (
    <button
      className={`relative flex h-11 items-center justify-center border-r border-stone-300 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-70 sm:h-12 ${
        isOpenString ? "bg-stone-950/95 text-amber-50" : "text-amber-50"
      } ${!disabled ? "hover:bg-emerald-400/20" : ""}`}
      type="button"
      aria-label={labelParts.join(", ")}
      disabled={disabled}
      onClick={() => onCellClick?.(cell)}
    >
      <span
        className="absolute left-0 right-0 top-1/2 bg-slate-200 shadow-sm"
        style={{ height: stringThickness, transform: "translateY(-50%)" }}
      />
      {shouldShowLabel ? (
        <span
          className={`relative z-10 flex min-h-6 min-w-6 items-center justify-center rounded-full px-1.5 leading-none ring-2 ${
            marker ? markerClasses[marker.type] : "bg-stone-950/75 text-amber-50 ring-transparent"
          }`}
        >
          {marker ? markerLabels[marker.type] : visibleLabel}
        </span>
      ) : null}
    </button>
  );
}
