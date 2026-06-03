import { buildFretboard, getFrets } from "../../music/fretboard";
import type { Tuning } from "../../types/music";
import { FretMarkers } from "./FretMarkers";
import { StringRow } from "./StringRow";

type FretboardProps = {
  tuning: Tuning;
  fretStart: number;
  fretEnd: number;
};

export function Fretboard({ tuning, fretStart, fretEnd }: FretboardProps) {
  const frets = getFrets(fretStart, fretEnd);
  const rows = buildFretboard(tuning, fretStart, fretEnd);
  const fretboardColumns = `repeat(${frets.length}, minmax(3rem, 1fr))`;

  return (
    <div className="overflow-x-auto rounded border border-stone-500 bg-stone-900 p-3 shadow-inner">
      <div className="min-w-[82rem]">
        <div
          className="grid overflow-hidden rounded border border-stone-700 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 shadow-sm"
          style={{ gridTemplateColumns: fretboardColumns }}
        >
          {rows.map((row) => (
            <StringRow key={row[0]?.stringNumber ?? row.length} cells={row} />
          ))}
        </div>
        <FretMarkers frets={frets} gridTemplateColumns={fretboardColumns} />
      </div>
    </div>
  );
}
