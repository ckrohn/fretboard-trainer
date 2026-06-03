# Guitar Fretboard Trainer

**Live app: [https://ckrohn.github.io/fretboard-trainer](https://ckrohn.github.io/fretboard-trainer)**

A browser-only React app for practicing guitar fretboard notes, intervals, and interval recognition. The app runs entirely in the browser and stores settings and progress locally with `localStorage`.

## Features

- **Visual note training**: identify the note shown at a highlighted fretboard position.
- **Visual interval training**: identify the interval between a marked root and target note on the fretboard.
- **Find all notes**: select every occurrence of a requested note across the active string and fret range.
- **Interval listening**: identify browser-generated intervals by ear, with melodic ascending or harmonic playback.
- **6-string and 7-string support**: switch between standard 6-string tuning (`E A D G B E`) and standard 7-string tuning (`B E A D G B E`).
- **Configurable practice scope**: choose fret range, active strings, allowed intervals, accidental preference, and fretboard display options.
- **Progress tracking**: view lifetime attempts, accuracy, best streak, weak intervals, weak notes, weak strings, and accuracy by instrument, tuning, note, interval, and string.
- **Keyboard-friendly answers**: use number keys for answer choices and `Enter` to continue after feedback.
- **Responsive UI**: designed for desktop, tablet, and mobile practice.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Web Audio API
- Vitest

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Deployment

The project is configured for GitHub Pages at:

[https://ckrohn.github.io/fretboard-trainer](https://ckrohn.github.io/fretboard-trainer)

Deploy the current build with:

```bash
npm run deploy
```
