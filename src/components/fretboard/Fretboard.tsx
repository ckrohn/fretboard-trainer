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
  const fretboardColumns = `repeat(${frets.length}, minmax(2.75rem, 1fr))`;

  return (
    <div className="overflow-x-auto rounded border border-stone-500 bg-stone-900 p-3 shadow-inner">
      <div className="min-w-[48rem]">
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
