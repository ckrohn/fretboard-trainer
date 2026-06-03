import { describe, expect, it } from "vitest";
import { STANDARD_6_STRING_TUNING, STANDARD_7_STRING_TUNING } from "../../music/tunings";
import { generateVisualNoteQuestion } from "./generateVisualNoteQuestion";

describe("generateVisualNoteQuestion", () => {
  it("only uses selected strings and fret range", () => {
    for (let index = 0; index < 40; index += 1) {
      const question = generateVisualNoteQuestion({
        tuning: STANDARD_6_STRING_TUNING,
        selectedStrings: [2, 3],
        startFret: 4,
        endFret: 6
      });

      expect([2, 3]).toContain(question.position.stringNumber);
      expect(question.position.fret).toBeGreaterThanOrEqual(4);
      expect(question.position.fret).toBeLessThanOrEqual(6);
    }
  });

  it("can use string 7 when standard 7-string is active", () => {
    const question = generateVisualNoteQuestion({
      tuning: STANDARD_7_STRING_TUNING,
      selectedStrings: [7],
      startFret: 0,
      endFret: 12
    });

    expect(question.position.stringNumber).toBe(7);
  });

  it("never uses string 7 when standard 6-string is active", () => {
    for (let index = 0; index < 40; index += 1) {
      const question = generateVisualNoteQuestion({
        tuning: STANDARD_6_STRING_TUNING,
        selectedStrings: [6, 5, 4, 3, 2, 1],
        startFret: 0,
        endFret: 12
      });

      expect(question.position.stringNumber).not.toBe(7);
    }
  });
});
