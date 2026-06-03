import type { KeyboardEvent } from "react";
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
  focusKey: string;
  onCellKeyDown?: (event: KeyboardEvent<HTMLButtonElement>, cell: FretboardCellData) => void;
};

const markerClasses: Record<FretboardMarker["type"], string> = {
  root: "bg-sky-600 text-white ring-white",
  target: "bg-violet-600 text-white ring-white",
  selected: "bg-amber-300 text-stone-950 ring-stone-950",
  correct: "bg-emerald-600 text-white ring-white",
  incorrect: "bg-red-600 text-white ring-white",
  missed: "bg-slate-200 text-slate-950 ring-slate-950"
};

const markerLabels: Record<FretboardMarker["type"], string> = {
  root: "R",
  target: "?",
  selected: "S",
  correct: "✓",
  incorrect: "✕",
  missed: "!"
};

const markerAriaLabels: Record<FretboardMarker["type"], string> = {
  root: "root",
  target: "target",
  selected: "selected",
  correct: "correct",
  incorrect: "incorrect",
  missed: "missed"
};

export function FretboardCell({
  cell,
  disabled,
  marker,
  onCellClick,
  openNoteName,
  showNoteNames,
  showStringNames,
  stringThickness,
  focusKey,
  onCellKeyDown
}: FretboardCellProps) {
  const isOpenString = cell.fret === 0;
  const labelParts = [`String ${cell.stringNumber}`, `fret ${cell.fret}`];

  if (showNoteNames || (showStringNames && isOpenString)) {
    labelParts.push(`note ${cell.noteName}`);
  }

  if (marker) {
    labelParts.push(markerAriaLabels[marker.type]);
  }

  const visibleLabel = isOpenString && showStringNames ? openNoteName : cell.noteName;
  const shouldShowLabel = showNoteNames || (isOpenString && showStringNames) || marker;

  return (
    <button
      className={`relative flex h-12 items-center justify-center border-r border-stone-300 text-xs font-semibold text-amber-50 transition focus:outline-none focus:ring-4 focus:ring-inset focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-80 sm:h-14 ${
        isOpenString ? "bg-stone-950/95" : ""
      } ${!disabled ? "hover:bg-emerald-300/20" : ""}`}
      type="button"
      aria-label={labelParts.join(", ")}
      data-fretboard-cell={focusKey}
      disabled={disabled}
      onClick={() => onCellClick?.(cell)}
      onKeyDown={(event) => onCellKeyDown?.(event, cell)}
    >
      <span
        className="absolute left-0 right-0 top-1/2 bg-slate-100 shadow-sm"
        style={{ height: stringThickness, transform: "translateY(-50%)" }}
      />
      {shouldShowLabel ? (
        <span
          className={`relative z-10 flex min-h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-sm leading-none ring-2 ${
            marker ? markerClasses[marker.type] : "bg-stone-950/80 text-amber-50 ring-transparent"
          }`}
        >
          {marker ? markerLabels[marker.type] : visibleLabel}
        </span>
      ) : null}
    </button>
  );
}
