import { describe, expect, it, vi } from "vitest";
import { STANDARD_6_STRING_TUNING, STANDARD_7_STRING_TUNING } from "../../music/tunings";
import { generateListeningQuestion } from "./generateListeningQuestion";

describe("generateListeningQuestion", () => {
  it("sets targetMidi to rootMidi plus interval semitones", () => {
    const question = generateListeningQuestion({ tuning: STANDARD_6_STRING_TUNING });

    expect(question.targetMidi).toBe(question.rootMidi + question.interval.semitones);
  });

  it("respects allowed intervals", () => {
    for (let index = 0; index < 20; index += 1) {
      const question = generateListeningQuestion({
        tuning: STANDARD_6_STRING_TUNING,
        allowedIntervals: ["m3"]
      });

      expect(question.interval.id).toBe("m3");
    }
  });

  it("keeps 6-string root range at MIDI 40 or above", () => {
    for (let index = 0; index < 30; index += 1) {
      const question = generateListeningQuestion({ tuning: STANDARD_6_STRING_TUNING });

      expect(question.rootMidi).toBeGreaterThanOrEqual(40);
    }
  });

  it("can generate MIDI 35 for 7-string tuning", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    try {
      const question = generateListeningQuestion({
        tuning: STANDARD_7_STRING_TUNING,
        allowedIntervals: ["P1"]
      });

      expect(question.rootMidi).toBe(35);
    } finally {
      randomSpy.mockRestore();
    }
  });
});
