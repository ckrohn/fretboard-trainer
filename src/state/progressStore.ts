export type ProgressState = {
  correctAnswers: number;
  attemptedAnswers: number;
};

export const INITIAL_PROGRESS_STATE: ProgressState = {
  correctAnswers: 0,
  attemptedAnswers: 0
};
