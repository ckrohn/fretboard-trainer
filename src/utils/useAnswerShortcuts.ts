import { useEffect, useRef } from "react";
import { isKeyboardInputTarget } from "./keyboard";

type UseAnswerShortcutsParams = {
  answerCount: number;
  canAnswer: boolean;
  canGoNext: boolean;
  onAnswer: (index: number) => void;
  onNext: () => void;
};

const MULTI_DIGIT_DELAY_MS = 450;

export const useAnswerShortcuts = ({
  answerCount,
  canAnswer,
  canGoNext,
  onAnswer,
  onNext
}: UseAnswerShortcutsParams): void => {
  const pendingDigitsRef = useRef("");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const clearPending = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = null;
      pendingDigitsRef.current = "";
    };

    const commitPending = () => {
      const shortcutNumber = Number(pendingDigitsRef.current);
      clearPending();

      if (
        Number.isInteger(shortcutNumber) &&
        shortcutNumber >= 1 &&
        shortcutNumber <= answerCount
      ) {
        onAnswer(shortcutNumber - 1);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isKeyboardInputTarget(event.target)) {
        return;
      }

      if (event.key === "Enter" && canGoNext) {
        event.preventDefault();
        clearPending();
        onNext();
        return;
      }

      if (!canAnswer || !/^\d$/.test(event.key)) {
        return;
      }

      event.preventDefault();
      const nextDigits = `${pendingDigitsRef.current}${event.key}`;
      const shortcutNumber = Number(nextDigits);
      const canBePrefix = Array.from({ length: answerCount }, (_, index) =>
        String(index + 1)
      ).some((shortcut) => shortcut.startsWith(nextDigits));

      if (!canBePrefix) {
        clearPending();
        return;
      }

      pendingDigitsRef.current = nextDigits;

      if (shortcutNumber > answerCount) {
        clearPending();
        return;
      }

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(commitPending, MULTI_DIGIT_DELAY_MS);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearPending();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [answerCount, canAnswer, canGoNext, onAnswer, onNext]);
};
