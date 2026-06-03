export const midiToFrequency = (midi: number): number => {
  if (!Number.isFinite(midi)) {
    throw new Error(`MIDI value must be a finite number. Received: ${midi}`);
  }

  return 440 * 2 ** ((midi - 69) / 12);
};
