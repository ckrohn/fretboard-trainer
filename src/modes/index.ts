import type { PracticeMode } from "../types/modes";

export const PRACTICE_MODES: PracticeMode[] = [
  {
    id: "visualNote",
    label: "Visual note training",
    description: "Identify the note shown on the fretboard.",
    instructions: "Use the note buttons to name the highlighted fretboard position."
  },
  {
    id: "visualInterval",
    label: "Visual interval training",
    description: "Identify the interval between a root and target position.",
    instructions: "Compare the marked root and target notes, then choose the interval."
  },
  {
    id: "findNotes",
    label: "Find all notes",
    description: "Find every occurrence of a requested note on the fretboard.",
    instructions: "Select all matching fretboard positions, then submit your answer."
  },
  {
    id: "intervalListening",
    label: "Interval listening",
    description: "Identify intervals by ear from browser-generated tones.",
    instructions: "Listen to the notes, then choose the interval you hear."
  }
];
