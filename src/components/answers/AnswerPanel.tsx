import { IntervalAnswerPanel } from "./IntervalAnswerPanel";
import { MultiSelectSubmitPanel } from "./MultiSelectSubmitPanel";
import { NoteAnswerPanel } from "./NoteAnswerPanel";
import type { PracticeModeId } from "../../types/modes";

type AnswerPanelProps = {
  modeId: PracticeModeId;
};

export function AnswerPanel({ modeId }: AnswerPanelProps) {
  if (modeId === "visualInterval" || modeId === "intervalListening") {
    return <IntervalAnswerPanel />;
  }

  if (modeId === "findNotes") {
    return <MultiSelectSubmitPanel />;
  }

  return <NoteAnswerPanel />;
}
