import { describe, expect, it } from "vitest";
import { STANDARD_6_STRING_TUNING, STANDARD_7_STRING_TUNING } from "../../music/tunings";
import { generateVisualIntervalQuestion } from "./generateVisualIntervalQuestion";

describe("generateVisualIntervalQuestion", () => {
  it("uses allowed intervals", () => {
    for (let index = 0; index < 30; index += 1) {
      const question = generateVisualIntervalQuestion({
        tuning: STANDARD_6_STRING_TUNING,
        selectedStrings: [6, 5, 4, 3, 2, 1],
        allowedIntervals: ["P5"]
      });

      expect(question.interval.id).toBe("P5");
    }
  });

  it("uses absolute MIDI distance", () => {
    const question = generateVisualIntervalQuestion({
      tuning: STANDARD_6_STRING_TUNING,
      selectedStrings: [1],
      startFret: 0,
      endFret: 12,
      allowedIntervals: ["P4"]
    });

    expect(question.target.midi - question.root.midi).toBe(5);
    expect(question.interval.id).toBe("P4");
  });

  it("does not generate impossible questions", () => {
    for (let index = 0; index < 40; index += 1) {
      const question = generateVisualIntervalQuestion({
        tuning: STANDARD_6_STRING_TUNING,
        selectedStrings: [6, 5, 4, 3, 2, 1],
        startFret: 0,
        endFret: 12
      });

      expect(question.target.midi).toBeGreaterThanOrEqual(question.root.midi);
      expect(question.target.midi - question.root.midi).toBe(question.interval.semitones);
      expect(question.interval.semitones).toBeGreaterThanOrEqual(0);
      expect(question.interval.semitones).toBeLessThanOrEqual(12);
    }
  });

  it("works on 6-string tuning", () => {
    const question = generateVisualIntervalQuestion({
      tuning: STANDARD_6_STRING_TUNING,
      selectedStrings: [6, 5, 4, 3, 2, 1]
    });

    expect(question.root.stringNumber).not.toBe(7);
    expect(question.target.stringNumber).not.toBe(7);
  });

  it("works on 7-string tuning including string 7 when selected", () => {
    const question = generateVisualIntervalQuestion({
      tuning: STANDARD_7_STRING_TUNING,
      selectedStrings: [7],
      startFret: 0,
      endFret: 12
    });

    expect(question.root.stringNumber).toBe(7);
    expect(question.target.stringNumber).toBe(7);
  });
});
