type FretMarkersProps = {
  frets: number[];
  gridTemplateColumns: string;
};

const markerCountForFret = (fret: number): number => {
  if (fret === 12 || fret === 24) {
    return 2;
  }

  return [3, 5, 7, 9, 15, 17, 19, 21].includes(fret) ? 1 : 0;
};

export function FretMarkers({ frets, gridTemplateColumns }: FretMarkersProps) {
  return (
    <div
      className="grid pt-2"
      style={{ gridTemplateColumns }}
      aria-label="Fret markers"
    >
      {frets.map((fret) => (
        <div className="flex h-4 items-start justify-center" key={fret}>
          <div className="flex h-3 items-center justify-center gap-1">
            {Array.from({ length: markerCountForFret(fret) }, (_, index) => (
              <span
                className="h-2 w-2 rounded-full bg-amber-100/80 shadow"
                key={`${fret}-${index}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
