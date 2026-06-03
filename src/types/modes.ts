export type PracticeModeId =
  | "visualNote"
  | "visualInterval"
  | "findNotes"
  | "intervalListening";

export type PracticeMode = {
  id: PracticeModeId;
  label: string;
  description: string;
  instructions: string;
};

export type SessionStats = {
  totalQuestions: number;
  correct: number;
  incorrect: number;
  currentStreak: number;
};

export type FeedbackStatus = "neutral" | "correct" | "incorrect";
