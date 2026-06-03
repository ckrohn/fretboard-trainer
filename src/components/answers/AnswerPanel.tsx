import { IntervalAnswerPanel } from "./IntervalAnswerPanel";
import { NoteAnswerPanel } from "./NoteAnswerPanel";
import type { PracticeModeId } from "../../types/modes";

type AnswerPanelProps = {
  modeId: PracticeModeId;
};

export function AnswerPanel({ modeId }: AnswerPanelProps) {
  return modeId === "visualInterval" ? (
    <IntervalAnswerPanel />
  ) : (
    <NoteAnswerPanel />
  );
}
