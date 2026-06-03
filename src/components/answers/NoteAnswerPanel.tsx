import { SHARP_NOTE_NAMES } from "../../music/notes";

export function NoteAnswerPanel() {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
      {SHARP_NOTE_NAMES.map((noteName) => (
        <button
          className="h-10 rounded border border-slate-300 bg-white text-sm font-medium text-slate-800 transition hover:border-emerald-500 hover:text-emerald-700"
          key={noteName}
          type="button"
        >
          {noteName}
        </button>
      ))}
    </div>
  );
}
