import { midiToFrequency } from "../../music/pitch";

type AudioContextConstructor = new () => AudioContext;

type WindowWithWebAudio = Window & typeof globalThis & {
  webkitAudioContext?: AudioContextConstructor;
};

export type IntervalPlaybackMode = "melodicAscending" | "harmonic";

export type PlayIntervalParams = {
  rootMidi: number;
  targetMidi: number;
  mode: IntervalPlaybackMode;
};

export type IntervalPlaybackHandle = {
  stop: () => void;
  finished: Promise<void>;
};

const ATTACK_SECONDS = 0.015;
const RELEASE_SECONDS = 0.12;
const NOTE_DURATION_SECONDS = 0.55;
const GAP_SECONDS = 0.12;
const PEAK_GAIN = 0.16;

const createAudioContext = (): AudioContext => {
  const audioWindow = window as WindowWithWebAudio;
  const AudioContextCtor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext;

  if (!AudioContextCtor) {
    throw new Error("Web Audio API is not available in this browser.");
  }

  return new AudioContextCtor();
};

const scheduleTone = (
  context: AudioContext,
  destination: AudioNode,
  midi: number,
  startTime: number,
  duration: number
): OscillatorNode => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const stopTime = startTime + duration + RELEASE_SECONDS;

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(midiToFrequency(midi), startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(PEAK_GAIN, startTime + ATTACK_SECONDS);
  gain.gain.setValueAtTime(PEAK_GAIN, startTime + duration);
  gain.gain.linearRampToValueAtTime(0, stopTime);
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(startTime);
  oscillator.stop(stopTime);

  return oscillator;
};

export const playInterval = ({
  rootMidi,
  targetMidi,
  mode
}: PlayIntervalParams): IntervalPlaybackHandle => {
  const context = createAudioContext();
  const startedAt = context.currentTime + 0.03;
  const oscillators: OscillatorNode[] = [];
  let didStop = false;
  const masterGain = context.createGain();
  masterGain.gain.setValueAtTime(0.85, startedAt);
  masterGain.connect(context.destination);

  if (mode === "melodicAscending") {
    oscillators.push(
      scheduleTone(context, masterGain, rootMidi, startedAt, NOTE_DURATION_SECONDS),
      scheduleTone(
        context,
        masterGain,
        targetMidi,
        startedAt + NOTE_DURATION_SECONDS + GAP_SECONDS,
        NOTE_DURATION_SECONDS
      )
    );
  } else {
    oscillators.push(
      scheduleTone(context, masterGain, rootMidi, startedAt, NOTE_DURATION_SECONDS),
      scheduleTone(context, masterGain, targetMidi, startedAt, NOTE_DURATION_SECONDS)
    );
  }

  const totalDuration =
    mode === "melodicAscending"
      ? NOTE_DURATION_SECONDS * 2 + GAP_SECONDS + RELEASE_SECONDS + 0.08
      : NOTE_DURATION_SECONDS + RELEASE_SECONDS + 0.08;

  const closeContext = () => {
    if (context.state !== "closed") {
      void context.close();
    }
  };

  const timeoutId = window.setTimeout(closeContext, totalDuration * 1000);
  const finished = new Promise<void>((resolve) => {
    window.setTimeout(() => {
      resolve();
    }, totalDuration * 1000);
  });

  return {
    stop: () => {
      if (didStop) {
        return;
      }

      didStop = true;
      window.clearTimeout(timeoutId);
      oscillators.forEach((oscillator) => {
        try {
          oscillator.stop();
        } catch {
          // Oscillator may already be stopped by its scheduled end time.
        }
      });
      closeContext();
    },
    finished
  };
};
