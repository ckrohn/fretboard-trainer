import { describe, expect, it } from "vitest";
import { getFretboardCells } from "../../music/fretboard";
import { noteNameToPitchClass } from "../../music/notes";
import { STANDARD_6_STRING_TUNING, STANDARD_7_STRING_TUNING } from "../../music/tunings";
import { evaluateFindNotesAnswer } from "./evaluateFindNotesAnswer";

const position = (stringNumber: number, fret: number) => ({ stringNumber, fret });

describe("evaluateFindNotesAnswer", () => {
  it("evaluates a perfect answer", () => {
    const cells = getFretboardCells(STANDARD_6_STRING_TUNING, 0, 0, [6, 5, 4, 3, 2, 1]);
    const correct = cells
      .filter((cell) => cell.pitchClass === noteNameToPitchClass("E"))
      .map((cell) => position(cell.stringNumber, cell.fret));
    const result = evaluateFindNotesAnswer(cells, noteNameToPitchClass("E"), correct);

    expect(result.isPerfect).toBe(true);
    expect(result.correctSelected).toHaveLength(correct.length);
    expect(result.missed).toHaveLength(0);
    expect(result.wrongSelected).toHaveLength(0);
  });

  it("detects missed notes", () => {
    const cells = getFretboardCells(STANDARD_6_STRING_TUNING, 0, 0, [6, 5, 4, 3, 2, 1]);
    const result = evaluateFindNotesAnswer(cells, noteNameToPitchClass("E"), []);

    expect(result.isPerfect).toBe(false);
    expect(result.missed.length).toBeGreaterThan(0);
  });

  it("detects wrong selections", () => {
    const cells = getFretboardCells(STANDARD_6_STRING_TUNING, 0, 0, [6, 5, 4, 3, 2, 1]);
    const result = evaluateFindNotesAnswer(cells, noteNameToPitchClass("E"), [position(5, 0)]);

    expect(result.isPerfect).toBe(false);
    expect(result.wrongSelected).toEqual([position(5, 0)]);
  });

  it("evaluates a mixed answer", () => {
    const cells = getFretboardCells(STANDARD_6_STRING_TUNING, 0, 0, [6, 5, 4, 3, 2, 1]);
    const result = evaluateFindNotesAnswer(cells, noteNameToPitchClass("E"), [position(6, 0), position(5, 0)]);

    expect(result.isPerfect).toBe(false);
    expect(result.correctSelected).toContainEqual(position(6, 0));
    expect(result.wrongSelected).toContainEqual(position(5, 0));
    expect(result.missed).toContainEqual(position(1, 0));
  });

  it("includes string 7 positions when 7-string is active", () => {
    const cells = getFretboardCells(STANDARD_7_STRING_TUNING, 0, 0, [7, 6, 5, 4, 3, 2, 1]);
    const result = evaluateFindNotesAnswer(cells, noteNameToPitchClass("B"), [position(7, 0), position(2, 0)]);

    expect(result.isPerfect).toBe(true);
    expect(result.correctSelected).toContainEqual(position(7, 0));
  });
});
