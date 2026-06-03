import { describe, expect, it } from "vitest";
import { getFretboardCells } from "./fretboard";
import { noteNameToPitchClass, pitchClassToNoteName } from "./notes";
import { midiToFrequency } from "./pitch";
import { STANDARD_6_STRING_TUNING, STANDARD_7_STRING_TUNING } from "./tunings";

describe("music utilities", () => {
  it("converts note names and enharmonic spellings to pitch classes", () => {
    expect(noteNameToPitchClass("C")).toBe(0);
    expect(noteNameToPitchClass("C#")).toBe(1);
    expect(noteNameToPitchClass("Db")).toBe(1);
    expect(noteNameToPitchClass("D#")).toBe(3);
    expect(noteNameToPitchClass("Eb")).toBe(3);
    expect(noteNameToPitchClass("F#")).toBe(6);
    expect(noteNameToPitchClass("Gb")).toBe(6);
    expect(noteNameToPitchClass("G#")).toBe(8);
    expect(noteNameToPitchClass("Ab")).toBe(8);
    expect(noteNameToPitchClass("A#")).toBe(10);
    expect(noteNameToPitchClass("Bb")).toBe(10);
  });

  it("converts pitch classes to sharp and flat note names", () => {
    expect(pitchClassToNoteName(1, "sharps")).toBe("C#");
    expect(pitchClassToNoteName(1, "flats")).toBe("Db");
    expect(pitchClassToNoteName(10, "sharps")).toBe("A#");
    expect(pitchClassToNoteName(10, "flats")).toBe("Bb");
  });

  it("converts A4 MIDI 69 to 440 Hz", () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 6);
  });

  it("generates fretboard cells for standard 6-string tuning", () => {
    const cells = getFretboardCells(STANDARD_6_STRING_TUNING, 0, 1, [6, 5, 4, 3, 2, 1]);

    expect(cells).toHaveLength(12);
    expect(cells[0]).toMatchObject({ stringNumber: 1, fret: 0, midi: 64, noteName: "E" });
    expect(cells.find((cell) => cell.stringNumber === 6 && cell.fret === 0)).toMatchObject({
      midi: 40,
      noteName: "E"
    });
  });

  it("generates fretboard cells for standard 7-string tuning", () => {
    const cells = getFretboardCells(STANDARD_7_STRING_TUNING, 0, 1, [7, 6, 5, 4, 3, 2, 1]);

    expect(cells).toHaveLength(14);
    expect(cells.find((cell) => cell.stringNumber === 7 && cell.fret === 0)).toMatchObject({
      midi: 35,
      noteName: "B"
    });
  });

  it("defines standard 7-string string 7 as B1 MIDI 35", () => {
    expect(STANDARD_7_STRING_TUNING.strings.find((string) => string.stringNumber === 7)).toEqual({
      stringNumber: 7,
      openNoteName: "B",
      openMidi: 35
    });
  });
});
