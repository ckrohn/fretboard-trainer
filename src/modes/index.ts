import type { PracticeMode } from "../types/modes";

export const PRACTICE_MODES: PracticeMode[] = [
  {
    id: "visualNote",
    label: "Visual note training",
    description: "Identify the note shown on the fretboard."
  },
  {
    id: "visualInterval",
    label: "Visual interval training",
    description: "Identify the interval between a root and target position."
  }
];
