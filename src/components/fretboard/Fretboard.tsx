import type { KeyboardEvent } from "react";
import { getFrets, validateSelectedStrings } from "../../music/fretboard";
import type {
  FretboardCellData,
  FretboardMarker,
  GuitarString,
  StringNumber,
  Tuning
} from "../../types/music";
import { FretboardCell } from "./FretboardCell";
import { FretMarkers } from "./FretMarkers";

type FretboardProps = {
  tuning: Tuning;
  cells: FretboardCellData[];
  selectedStrings?: readonly StringNumber[];
  startFret?: number;
  endFret?: number;
  markers?: readonly FretboardMarker[];
  onCellClick?: (cell: FretboardCellData) => void;
  disabled?: boolean;
  showNoteNames?: boolean;
  showStringNames?: boolean;
  showFretNumbers?: boolean;
  highStringOnTop?: boolean;
};

const getOrderedStrings = (
  tuning: Tuning,
  selectedStrings: readonly StringNumber[],
  highStringOnTop: boolean
): GuitarString[] => {
  const selectedStringSet = new Set(selectedStrings);
  const selected = tuning.strings.filter((string) =>
    selectedStringSet.has(string.stringNumber)
  );

  return [...selected].sort((a, b) =>
    highStringOnTop
      ? a.stringNumber - b.stringNumber
      : b.stringNumber - a.stringNumber
  );
};

const getStringThickness = (stringNumber: StringNumber): string =>
  `${Math.min(4, 1 + stringNumber * 0.35)}px`;

const focusCell = (stringNumber: StringNumber, fret: number): void => {
  const selector = `[data-fretboard-cell="${stringNumber}-${fret}"]`;
  const element = document.querySelector<HTMLButtonElement>(selector);
  element?.focus();
};

export function Fretboard({
  tuning,
  cells,
  selectedStrings = tuning.strings.map((string) => string.stringNumber),
  startFret = 0,
  endFret = 12,
  markers = [],
  onCellClick,
  disabled = false,
  showNoteNames = false,
  showStringNames = true,
  showFretNumbers = true,
  highStringOnTop = true
}: FretboardProps) {
  const frets = getFrets(startFret, endFret);
  validateSelectedStrings(tuning, selectedStrings);

  const orderedStrings = getOrderedStrings(tuning, selectedStrings, highStringOnTop);
  const cellByPosition = new Map(
    cells.map((cell) => [`${cell.stringNumber}-${cell.fret}`, cell] as const)
  );
  const markerByPosition = new Map(
    markers.map((marker) => [`${marker.stringNumber}-${marker.fret}`, marker] as const)
  );
  const fretboardColumns = `repeat(${frets.length}, minmax(3.25rem, 1fr))`;

  const handleCellKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    cell: FretboardCellData
  ) => {
    const rowIndex = orderedStrings.findIndex(
      (string) => string.stringNumber === cell.stringNumber
    );
    const fretIndex = frets.indexOf(cell.fret);

    if (rowIndex < 0 || fretIndex < 0) {
      return;
    }

    const nextRowIndex =
      event.key === "ArrowUp"
        ? Math.max(0, rowIndex - 1)
        : event.key === "ArrowDown"
          ? Math.min(orderedStrings.length - 1, rowIndex + 1)
          : rowIndex;
    const nextFretIndex =
      event.key === "ArrowLeft"
        ? Math.max(0, fretIndex - 1)
        : event.key === "ArrowRight"
          ? Math.min(frets.length - 1, fretIndex + 1)
          : fretIndex;

    if (nextRowIndex !== rowIndex || nextFretIndex !== fretIndex) {
      event.preventDefault();
      focusCell(orderedStrings[nextRowIndex].stringNumber, frets[nextFretIndex]);
    }
  };

  return (
    <div
      className="overflow-x-auto rounded border border-stone-500 bg-stone-900 p-2 shadow-inner sm:p-3"
      aria-label={`${tuning.label} fretboard`}
    >
      <div className="min-w-[56rem]">
        {showFretNumbers ? (
          <FretMarkers
            frets={frets}
            gridTemplateColumns={fretboardColumns}
            position="above"
            showFretNumbers
          />
        ) : null}
        <div
          className="grid overflow-hidden rounded border border-stone-700 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 shadow-sm"
          style={{ gridTemplateColumns: fretboardColumns }}
        >
          {orderedStrings.flatMap((string) =>
            frets.map((fret) => {
              const cell = cellByPosition.get(`${string.stringNumber}-${fret}`);

              if (!cell) {
                throw new Error(
                  `Missing fretboard cell for string ${string.stringNumber}, fret ${fret}.`
                );
              }

              return (
                <FretboardCell
                  key={`${cell.stringNumber}-${cell.fret}`}
                  cell={cell}
                  disabled={disabled}
                  marker={markerByPosition.get(`${cell.stringNumber}-${cell.fret}`)}
                  onCellClick={onCellClick}
                  openNoteName={string.openNoteName}
                  showNoteNames={showNoteNames}
                  showStringNames={showStringNames}
                  stringThickness={getStringThickness(string.stringNumber)}
                  focusKey={`${cell.stringNumber}-${cell.fret}`}
                  onCellKeyDown={handleCellKeyDown}
                />
              );
            })
          )}
        </div>
        {!showFretNumbers ? (
          <FretMarkers
            frets={frets}
            gridTemplateColumns={fretboardColumns}
            position="below"
          />
        ) : null}
      </div>
    </div>
  );
}
