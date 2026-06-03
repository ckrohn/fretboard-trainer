import type { FretboardCellData } from "../../types/music";
import { FretboardCell } from "./FretboardCell";

type StringRowProps = {
  cells: FretboardCellData[];
};

export function StringRow({ cells }: StringRowProps) {
  const firstCell = cells[0];
  const stringThickness = firstCell
    ? `${Math.min(4, 1 + firstCell.stringNumber * 0.35)}px`
    : "1px";

  return (
    <>
      {cells.map((cell) => (
        <FretboardCell
          key={`${cell.stringNumber}-${cell.fret}`}
          cell={cell}
          stringThickness={stringThickness}
        />
      ))}
    </>
  );
}
