export function MultiSelectSubmitPanel() {
  return (
    <div className="flex flex-col gap-3 text-sm text-slate-600">
      <p>Select matching fretboard positions when this mode is implemented.</p>
      <button
        className="h-10 rounded border border-slate-300 bg-white px-4 font-medium text-slate-800 transition hover:border-emerald-500 hover:text-emerald-700"
        type="button"
      >
        Submit selected notes
      </button>
    </div>
  );
}
