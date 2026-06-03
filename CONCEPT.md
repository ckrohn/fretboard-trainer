# Guitar interval trainer app concept with 6-string and 7-string support from the start

## 1. Product idea

Build a **front-end-only guitar fretboard ear and theory trainer** with first-class support for:

```txt
6-string guitar
7-string guitar
```

The app should have four core modes:

1. **Visual interval training**
   The app shows a fretboard position with:

   * one marked **root note**
   * one marked but unlabeled **target note**
     The user identifies the interval from root to target.

2. **Visual note training**
   The app shows one marked fretboard position.
   The user identifies the note name.

3. **Find all notes on fretboard**
   The app gives a note name, for example `F#`.
   The user clicks every occurrence of that note on the selected strings and fret range.

4. **Interval listening practice**
   The app plays:

   * a root note
   * an interval note
     either:
   * sequentially
   * harmonically
   * or both
     The user identifies the interval by ear.

The app should run entirely in the browser. No API, no server, no database. Use local state and `localStorage` for user settings and progress.

The important design decision is this:

```txt
Do not hardcode six strings anywhere.
```

Instead, the fretboard, tuning model, question generators, settings, and progress tracking should all work with an `InstrumentConfig` or `Tuning` object that can contain either six or seven strings.

---

# 2. Recommended implementation stack

Use:

```txt
React
TypeScript
Vite
Tailwind CSS
Web Audio API
localStorage
```

Optional but useful:

```txt
Zustand or React Context for global state
Vitest for unit tests
Playwright later for end-to-end tests
```

For Codex, use clear task prompts with project context, files, goals, and validation instructions. OpenAI’s Codex documentation describes prompts as user messages that tell Codex what to do, and Codex then works through file reads, edits, and tool calls until the task is complete or canceled. ([OpenAI Developers][1])

---

# 3. Core app structure

## Main screens

```txt
Home / Mode selection
Settings
Practice session
Results / Review
```

## Main components

```txt
App
ModeSelector
PracticeLayout
Fretboard
FretboardCell
AnswerPanel
IntervalAnswerButtons
NoteAnswerButtons
SessionHeader
FeedbackPanel
SettingsPanel
InstrumentSelector
ProgressSummary
AudioControls
```

## Suggested folder structure

```txt
src/
  app/
    App.tsx
    routes.ts
  components/
    fretboard/
      Fretboard.tsx
      FretboardCell.tsx
      StringRow.tsx
      FretMarkers.tsx
    answers/
      IntervalAnswerPanel.tsx
      NoteAnswerPanel.tsx
      MultiSelectSubmitPanel.tsx
    layout/
      PracticeLayout.tsx
      SessionHeader.tsx
      FeedbackPanel.tsx
    settings/
      SettingsPanel.tsx
      InstrumentSelector.tsx
      StringSelector.tsx
    audio/
      AudioControls.tsx
  modes/
    visualInterval/
      VisualIntervalMode.tsx
      generateVisualIntervalQuestion.ts
    visualNote/
      VisualNoteMode.tsx
      generateVisualNoteQuestion.ts
    findNotes/
      FindNotesMode.tsx
      generateFindNotesQuestion.ts
      evaluateFindNotesAnswer.ts
    intervalListening/
      IntervalListeningMode.tsx
      generateListeningQuestion.ts
      playInterval.ts
  music/
    notes.ts
    intervals.ts
    tunings.ts
    instruments.ts
    fretboard.ts
    pitch.ts
  state/
    settingsStore.ts
    sessionStore.ts
    progressStore.ts
  types/
    music.ts
    modes.ts
    settings.ts
  utils/
    random.ts
    localStorage.ts
  tests/
    music.test.ts
    intervalGeneration.test.ts
```

---

# 4. Music model

## Notes

Use pitch classes internally:

```ts
type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
```

Recommended canonical sharp names:

```ts
const SHARP_NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B"
] as const;
```

Flat equivalents:

```ts
const FLAT_NOTE_NAMES = [
  "C", "Db", "D", "Eb", "E", "F",
  "Gb", "G", "Ab", "A", "Bb", "B"
] as const;
```

Enharmonic input should usually accept both:

```txt
C# = Db
D# = Eb
F# = Gb
G# = Ab
A# = Bb
```

## Instrument and tuning model

Do not model the guitar as a fixed six-string instrument. Model it as a tuning with an ordered list of strings.

```ts
type StringNumber = number;

type GuitarString = {
  stringNumber: StringNumber;
  openNoteName: string;
  openMidi: number;
};

type InstrumentType = "sixStringGuitar" | "sevenStringGuitar";

type Tuning = {
  id: string;
  label: string;
  instrumentType: InstrumentType;
  stringCount: 6 | 7;
  strings: GuitarString[];
};
```

Use the conventional guitar string numbering:

```txt
String 1 = highest-pitched string
String 6 = lowest string on a standard 6-string guitar
String 7 = lowest string on a standard 7-string guitar
```

For rendering and generation, store strings from low to high or high to low consistently. I recommend storing tunings from low to high because pitch calculations become visually clear:

```txt
7, 6, 5, 4, 3, 2, 1 for 7-string
6, 5, 4, 3, 2, 1 for 6-string
```

The UI can still render string 1 at the top.

---

## Standard 6-string tuning

Represent strings from low to high:

```ts
const STANDARD_6_STRING_TUNING: Tuning = {
  id: "standard-6",
  label: "Standard 6-string: E A D G B E",
  instrumentType: "sixStringGuitar",
  stringCount: 6,
  strings: [
    { stringNumber: 6, openNoteName: "E", openMidi: 40 },
    { stringNumber: 5, openNoteName: "A", openMidi: 45 },
    { stringNumber: 4, openNoteName: "D", openMidi: 50 },
    { stringNumber: 3, openNoteName: "G", openMidi: 55 },
    { stringNumber: 2, openNoteName: "B", openMidi: 59 },
    { stringNumber: 1, openNoteName: "E", openMidi: 64 }
  ]
};
```

## Standard 7-string tuning

Represent strings from low to high:

```ts
const STANDARD_7_STRING_TUNING: Tuning = {
  id: "standard-7",
  label: "Standard 7-string: B E A D G B E",
  instrumentType: "sevenStringGuitar",
  stringCount: 7,
  strings: [
    { stringNumber: 7, openNoteName: "B", openMidi: 35 },
    { stringNumber: 6, openNoteName: "E", openMidi: 40 },
    { stringNumber: 5, openNoteName: "A", openMidi: 45 },
    { stringNumber: 4, openNoteName: "D", openMidi: 50 },
    { stringNumber: 3, openNoteName: "G", openMidi: 55 },
    { stringNumber: 2, openNoteName: "B", openMidi: 59 },
    { stringNumber: 1, openNoteName: "E", openMidi: 64 }
  ]
};
```

## Optional tunings to include early

You can include these from the start, even if the first MVP only enables standard tunings:

```ts
const DROP_D_6_STRING_TUNING: Tuning = {
  id: "drop-d-6",
  label: "Drop D 6-string: D A D G B E",
  instrumentType: "sixStringGuitar",
  stringCount: 6,
  strings: [
    { stringNumber: 6, openNoteName: "D", openMidi: 38 },
    { stringNumber: 5, openNoteName: "A", openMidi: 45 },
    { stringNumber: 4, openNoteName: "D", openMidi: 50 },
    { stringNumber: 3, openNoteName: "G", openMidi: 55 },
    { stringNumber: 2, openNoteName: "B", openMidi: 59 },
    { stringNumber: 1, openNoteName: "E", openMidi: 64 }
  ]
};

const DROP_A_7_STRING_TUNING: Tuning = {
  id: "drop-a-7",
  label: "Drop A 7-string: A E A D G B E",
  instrumentType: "sevenStringGuitar",
  stringCount: 7,
  strings: [
    { stringNumber: 7, openNoteName: "A", openMidi: 33 },
    { stringNumber: 6, openNoteName: "E", openMidi: 40 },
    { stringNumber: 5, openNoteName: "A", openMidi: 45 },
    { stringNumber: 4, openNoteName: "D", openMidi: 50 },
    { stringNumber: 3, openNoteName: "G", openMidi: 55 },
    { stringNumber: 2, openNoteName: "B", openMidi: 59 },
    { stringNumber: 1, openNoteName: "E", openMidi: 64 }
  ]
};
```

For a first version, I would actively support:

```txt
Standard 6-string
Standard 7-string
```

Then add:

```txt
Drop D 6-string
Drop A 7-string
Custom tuning
```

---

## Fretboard pitch calculation

For a fretboard cell:

```ts
midi = openStringMidi + fret
pitchClass = midi % 12
```

A fretboard cell should not assume a six-string guitar:

```ts
type FretboardPosition = {
  stringNumber: number;
  fret: number;
};

type FretboardCellData = FretboardPosition & {
  midi: number;
  pitchClass: PitchClass;
  noteName: string;
};
```

For stronger typing, you may use this:

```ts
type SixStringNumber = 1 | 2 | 3 | 4 | 5 | 6;
type SevenStringNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type GuitarStringNumber = SixStringNumber | SevenStringNumber;
```

But the most flexible version is:

```ts
type StringNumber = number;
```

Then validate selected strings against the active tuning.

---

## Intervals

Use semitone distance as the source of truth.

```ts
const SIMPLE_INTERVALS = [
  { id: "P1", label: "Unison", shortLabel: "P1", semitones: 0 },
  { id: "m2", label: "Minor 2nd", shortLabel: "m2", semitones: 1 },
  { id: "M2", label: "Major 2nd", shortLabel: "M2", semitones: 2 },
  { id: "m3", label: "Minor 3rd", shortLabel: "m3", semitones: 3 },
  { id: "M3", label: "Major 3rd", shortLabel: "M3", semitones: 4 },
  { id: "P4", label: "Perfect 4th", shortLabel: "P4", semitones: 5 },
  { id: "TT", label: "Tritone", shortLabel: "TT", semitones: 6 },
  { id: "P5", label: "Perfect 5th", shortLabel: "P5", semitones: 7 },
  { id: "m6", label: "Minor 6th", shortLabel: "m6", semitones: 8 },
  { id: "M6", label: "Major 6th", shortLabel: "M6", semitones: 9 },
  { id: "m7", label: "Minor 7th", shortLabel: "m7", semitones: 10 },
  { id: "M7", label: "Major 7th", shortLabel: "M7", semitones: 11 },
  { id: "P8", label: "Octave", shortLabel: "P8", semitones: 12 }
];
```

For the visual interval mode, decide whether the first version should train:

```txt
simple intervals only: use semitones modulo 12, except octave as 12
absolute ascending intervals: use real pitch distance
ascending and descending intervals: include direction in the answer
compound intervals: include 9ths, 10ths, 11ths, 12ths, 13ths
```

For a first version, I recommend:

```txt
Visual interval mode:
- only generate target notes above or equal to the root in absolute pitch
- train P1 through P8
- avoid descending intervals until the core app works
```

That removes ambiguity.

---

# 5. Global settings

The app should expose a settings panel shared by all modes.

## General settings

```txt
Instrument:
- 6-string guitar
- 7-string guitar

Tuning:
- Standard 6-string: E A D G B E
- Standard 7-string: B E A D G B E
- Drop D 6-string later
- Drop A 7-string later
- Custom later

Fret range:
- start fret
- end fret

Selected strings:
- For 6-string: 6, 5, 4, 3, 2, 1
- For 7-string: 7, 6, 5, 4, 3, 2, 1

Note naming:
- sharps
- flats
- both accepted

Left-handed mode:
- normal
- mirrored

String display orientation:
- high string on top
- low string on top

Show fret numbers:
- on
- off

Show string names:
- on
- off
```

When the user switches from a seven-string tuning to a six-string tuning, remove string 7 from the selected strings automatically.

Example:

```txt
Before:
Active tuning: Standard 7-string
Selected strings: 7, 6, 5, 4, 3, 2, 1

After switching to Standard 6-string:
Selected strings: 6, 5, 4, 3, 2, 1
```

## Visual interval settings

```txt
Allowed intervals:
- P1
- m2
- M2
- m3
- M3
- P4
- tritone
- P5
- m6
- M6
- m7
- M7
- P8

Difficulty:
- same string only
- adjacent strings
- any selected strings
- restrict to common guitar shapes
- full random

Instrument scope:
- active tuning only
- selected strings only
- full fretboard

Answer style:
- buttons
- keyboard shortcuts
```

## Visual note settings

```txt
Allowed notes:
- all notes
- natural notes only
- accidentals only

Question generation:
- random note position
- avoid immediate repeats
- weighted toward weak notes

Instrument scope:
- active tuning only
- selected strings only
```

## Find all notes settings

```txt
Target notes:
- all notes
- natural notes only
- accidentals only

Require all occurrences:
- yes

Mistake behavior:
- immediate feedback
- feedback only after submit

Instrument scope:
- active tuning only
- selected strings only
- selected fret range only
```

## Listening settings

```txt
Root note range:
- six-string guitar range
- seven-string guitar range
- selected tuning range
- middle guitar range
- custom MIDI range

Intervals:
- same interval pool as visual mode

Playback:
- ascending melodic
- descending melodic
- harmonic
- mixed

Instrument:
- sine wave
- triangle wave
- clean guitar sample later

Repeat button:
- yes

Auto-play next question:
- optional
```

For version 1, I recommend this listening behavior:

```txt
If active instrument is 6-string:
- default root MIDI range: 40 to 72

If active instrument is 7-string:
- default root MIDI range: 35 to 72

Always ensure:
- targetMidi = rootMidi + interval.semitones
- targetMidi stays within a reasonable guitar-like range
```

---

# 6. Mode design

## Mode 1: Visual interval training

### User flow

1. App uses the active tuning:

   * standard 6-string
   * or standard 7-string
2. App generates a root fretboard position from the selected strings and fret range.
3. App generates a target position that forms one allowed interval above the root.
4. Fretboard shows:

   * root note with label, for example `Root: C`
   * target note as `?`
5. User chooses interval.
6. App shows feedback.
7. User moves to next question.

### Example UI

```txt
Question:
What is the interval from the root to the marked note?

Instrument:
7-string guitar, standard tuning

Fretboard:
Root: C marked in one style
Target: ? marked in another style

Answer buttons:
P1 m2 M2 m3 M3 P4 TT P5 m6 M6 m7 M7 P8

Feedback:
Correct: Perfect 5th
Root: C, target: G
Distance: 7 semitones
String 7, fret 1 to string 6, fret 3
```

### Question object

```ts
type VisualIntervalQuestion = {
  id: string;
  tuningId: string;
  stringCount: 6 | 7;
  rootPosition: FretboardPosition;
  targetPosition: FretboardPosition;
  rootMidi: number;
  targetMidi: number;
  rootPitchClass: PitchClass;
  targetPitchClass: PitchClass;
  intervalId: IntervalId;
};
```

### Evaluation

```ts
function evaluateVisualIntervalAnswer(
  question: VisualIntervalQuestion,
  answer: IntervalId
): boolean {
  return question.intervalId === answer;
}
```

### Important seven-string generation rule

On a seven-string guitar, the low B string creates more low-register positions. Make sure the generator does not accidentally exclude string 7.

Correct generation approach:

```txt
1. Build all fretboard cells from the active tuning.
2. Filter by selected strings.
3. Filter by fret range.
4. Pick a root cell.
5. Pick an allowed interval.
6. Find target cells where:
   targetCell.midi - rootCell.midi === interval.semitones
7. If no target cells exist, retry.
```

This works for both six and seven strings.

---

## Mode 2: Visual note training

### User flow

1. App chooses a random string and fret from the active tuning, selected strings, and fret range.
2. App marks that position.
3. User identifies the note.
4. App accepts enharmonic equivalents depending on settings.
5. App shows feedback.

### Example UI

```txt
Question:
What note is marked on the fretboard?

Instrument:
7-string guitar, standard tuning

Fretboard:
One marked position

Answer buttons:
C C# D D# E F F# G G# A A# B

Feedback:
Correct: F#
Also accepted: Gb
String 7, fret 7
```

### Question object

```ts
type VisualNoteQuestion = {
  id: string;
  tuningId: string;
  stringCount: 6 | 7;
  position: FretboardPosition;
  midi: number;
  pitchClass: PitchClass;
  acceptedAnswers: string[];
};
```

---

## Mode 3: Find all notes on fretboard

### User flow

1. App gives a target note, for example `A`.
2. Fretboard is clickable.
3. User selects all positions that contain that note.
4. User submits.
5. App compares selected positions against all correct positions in the active tuning, selected strings, and fret range.
6. Feedback shows:

   * correct selected notes
   * missed notes
   * wrong selections

### Example UI

```txt
Question:
Find all A notes.

Instrument:
7-string guitar, standard tuning

User clicks all A positions across the selected strings.

After submit:
Correct: 10 / 10
Wrong selections: 0
Missed notes: none
```

The exact count depends on the active tuning, fret range, and selected strings. A 7-string fretboard will usually have more target positions than a 6-string fretboard over the same fret range.

### Question object

```ts
type FindNotesQuestion = {
  id: string;
  tuningId: string;
  stringCount: 6 | 7;
  targetPitchClass: PitchClass;
  targetDisplayName: string;
  correctPositions: FretboardPosition[];
};
```

### Evaluation result

```ts
type FindNotesEvaluation = {
  isPerfect: boolean;
  correctSelected: FretboardPosition[];
  missed: FretboardPosition[];
  wrongSelected: FretboardPosition[];
};
```

### Position comparison

Use a stable key:

```ts
function positionKey(position: FretboardPosition): string {
  return `${position.stringNumber}:${position.fret}`;
}
```

---

## Mode 4: Interval listening practice

### User flow

1. App picks a root pitch.
2. App picks an allowed interval.
3. App plays:

   * root then interval note
   * or both at once
4. User chooses the interval.
5. App shows feedback.
6. User can replay the question.

### Audio approach

Use the browser’s **Web Audio API**.

For version 1:

```txt
Oscillator type:
- sine
- triangle

Envelope:
- short attack
- medium decay
- clean release

Playback:
- melodic ascending
- harmonic
```

Later, add bundled guitar samples in the app:

```txt
public/audio/guitar/6-string/E2.mp3
public/audio/guitar/6-string/F2.mp3
...
public/audio/guitar/7-string/B1.mp3
public/audio/guitar/7-string/C2.mp3
...
```

Still front-end-only because samples are static app assets.

### Frequency calculation

Use A4 = 440 Hz:

```ts
function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
```

### Listening question object

```ts
type ListeningIntervalQuestion = {
  id: string;
  instrumentType: InstrumentType;
  tuningId: string;
  rootMidi: number;
  targetMidi: number;
  intervalId: IntervalId;
  playbackMode: "melodicAscending" | "melodicDescending" | "harmonic";
};
```

### Listening range for seven-string support

Use different defaults by instrument:

```ts
const DEFAULT_LISTENING_ROOT_RANGES = {
  sixStringGuitar: { minMidi: 40, maxMidi: 72 },
  sevenStringGuitar: { minMidi: 35, maxMidi: 72 }
} as const;
```

When generating a question:

```ts
targetMidi = rootMidi + interval.semitones
```

Then ensure target MIDI is still playable or at least within the configured listening range.

---

# 7. Scoring and progress

Since there is no database, use in-memory state plus `localStorage`.

## Session score

```ts
type SessionStats = {
  mode: PracticeMode;
  instrumentType: InstrumentType;
  tuningId: string;
  total: number;
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
};
```

## Per-item stats

Track weak notes and weak intervals locally:

```ts
type ItemStats = {
  attempts: number;
  correct: number;
  lastSeenAt: number;
};
```

Store by key:

```txt
interval:P5
interval:m3
note:F#
fretboard:standard-6:6:5
fretboard:standard-7:7:5
```

Include tuning in the key when the stat depends on string position. Without tuning in the key, string 7 fret 5 on a seven-string guitar and string 6 fret 5 on a six-string guitar can be confused in analysis.

## localStorage keys

```txt
guitarTrainer.settings
guitarTrainer.progress
guitarTrainer.lastSession
```

## Useful feedback metrics

```txt
Accuracy
Current streak
Best streak
Weakest intervals
Weakest notes
Weakest strings
Average response time
Accuracy by instrument
Accuracy by tuning
```

For the first build, only implement:

```txt
session total
correct count
incorrect count
streak
best streak
```

---

# 8. Fretboard behavior

## Orientation

Default guitar view:

```txt
String 1 high E at top
String 6 low E at bottom on 6-string
String 7 low B at bottom on 7-string
Fret 0 on the left
Higher frets to the right
```

Optional settings:

```txt
String 1 on top
Lowest string on top
Left-handed mirrored fret direction
```

## Fretboard cell data

```ts
type FretboardPosition = {
  stringNumber: number;
  fret: number;
};

type FretboardCellData = FretboardPosition & {
  midi: number;
  pitchClass: PitchClass;
  noteName: string;
};
```

## Visual states

Each cell can be:

```txt
normal
root
target
selected
correct
incorrect
missed
disabled
```

## Dynamic string rendering

The fretboard should derive its rows from the active tuning:

```ts
function getRenderableStrings(tuning: Tuning, highStringOnTop: boolean): GuitarString[] {
  return [...tuning.strings].sort((a, b) =>
    highStringOnTop
      ? a.stringNumber - b.stringNumber
      : b.stringNumber - a.stringNumber
  );
}
```

For standard seven-string with high string on top:

```txt
1 E
2 B
3 G
4 D
5 A
6 E
7 B
```

For standard six-string with high string on top:

```txt
1 E
2 B
3 G
4 D
5 A
6 E
```

---

# 9. First milestone

The first useful milestone should be:

```txt
React + TypeScript app
Standard 6-string tuning
Standard 7-string tuning
Instrument selector
Frets 0 to 12
Selected strings based on active tuning
Visual note training
Visual interval training
Basic answer buttons
Basic score
No audio yet
No persistence yet
```

Then add:

```txt
Find all notes mode
Settings
localStorage
Interval listening mode
Progress tracking
Keyboard shortcuts
Mobile layout
Additional tunings
Custom tuning
```

---

# 10. Development prompts for Codex

Below are prompts you can paste into Codex one at a time. They are written as concrete implementation tasks. OpenAI’s best-practices documentation recommends making reusable guidance with `AGENTS.md`, which loads into context automatically and can document how Codex should work inside a repository. ([OpenAI Developers][2])

---

## Prompt 1: Create the project scaffold

```txt
Create a new front-end-only React + TypeScript + Vite app for a guitar fretboard trainer.

Requirements:
- Use React and TypeScript.
- Use Vite.
- Use Tailwind CSS for styling.
- No backend.
- No API.
- No database.
- The app should run fully in the browser.
- The app must support both 6-string and 7-string guitars from the beginning.
- Do not hardcode six strings anywhere.
- Use localStorage later, but do not implement persistence yet.
- Create a clean folder structure under src:
  - components/fretboard
  - components/answers
  - components/layout
  - components/settings
  - modes/visualNote
  - modes/visualInterval
  - music
  - state
  - types
  - utils
- Add a simple App component with:
  - app title
  - instrument selector with 6-string and 7-string options
  - mode selector
  - placeholder practice area
- Add basic responsive styling.

Validation:
- npm install should work.
- npm run dev should start the app.
- npm run build should pass.
- TypeScript should have no errors.
```

---

## Prompt 2: Add core music theory utilities

```txt
Implement the core music theory utilities for the guitar trainer.

Create these files:
- src/music/notes.ts
- src/music/intervals.ts
- src/music/tunings.ts
- src/music/instruments.ts
- src/music/fretboard.ts
- src/music/pitch.ts
- src/types/music.ts
- src/tests/music.test.ts if a test setup exists, otherwise skip tests and add simple exported functions only.

Requirements:
1. Represent pitch classes 0 to 11.
2. Provide sharp note names and flat note names.
3. Provide a function noteNameToPitchClass(noteName: string): PitchClass.
4. Accept enharmonic spellings:
   - C# and Db
   - D# and Eb
   - F# and Gb
   - G# and Ab
   - A# and Bb
5. Provide a function pitchClassToNoteName(pitchClass, accidentalPreference).
6. Define a general Tuning type that supports both 6-string and 7-string guitars.
7. Do not hardcode the fretboard to six strings.
8. Define standard 6-string guitar tuning from low E to high E:
   - string 6: E2, MIDI 40
   - string 5: A2, MIDI 45
   - string 4: D3, MIDI 50
   - string 3: G3, MIDI 55
   - string 2: B3, MIDI 59
   - string 1: E4, MIDI 64
9. Define standard 7-string guitar tuning from low B to high E:
   - string 7: B1, MIDI 35
   - string 6: E2, MIDI 40
   - string 5: A2, MIDI 45
   - string 4: D3, MIDI 50
   - string 3: G3, MIDI 55
   - string 2: B3, MIDI 59
   - string 1: E4, MIDI 64
10. Provide getTuningById(tuningId).
11. Provide getDefaultTuningForInstrument(instrumentType).
12. Provide getStringNumbersForTuning(tuning).
13. Provide getFretboardCells(tuning, startFret, endFret, selectedStrings, accidentalPreference).
14. Each cell should include:
   - stringNumber
   - fret
   - midi
   - pitchClass
   - noteName
15. Define intervals:
   - P1, m2, M2, m3, M3, P4, TT, P5, m6, M6, m7, M7, P8
16. Provide getIntervalBySemitones(semitones).
17. Provide midiToFrequency(midi).
18. Validate selected strings against the active tuning.

Validation:
- All functions should be strongly typed.
- No any types.
- Edge cases should throw clear errors.
- npm run build should pass.
```

---

## Prompt 3: Build the reusable fretboard component

```txt
Build a reusable guitar fretboard component that supports both 6-string and 7-string guitars.

Files:
- src/components/fretboard/Fretboard.tsx
- src/components/fretboard/FretboardCell.tsx
- src/components/fretboard/FretMarkers.tsx if useful
- update shared types if needed

Requirements:
1. Render the number of strings from the active tuning, not from a hardcoded value.
2. Support six strings and seven strings.
3. Render frets 0 to 12 by default.
4. Accept props:
   - tuning
   - cells
   - selectedStrings
   - startFret
   - endFret
   - markers
   - onCellClick
   - disabled
   - showNoteNames
   - showStringNames
   - showFretNumbers
   - highStringOnTop
5. A marker should be able to represent:
   - root
   - target
   - selected
   - correct
   - incorrect
   - missed
6. The component should not contain mode-specific logic.
7. It should be responsive.
8. Use semantic button elements for clickable fretboard cells.
9. Add accessible labels such as:
   - "String 7, fret 3"
   - "String 6, fret 3"
   - "String 2, fret 8, note G"
10. Display fret numbers above or below the fretboard.
11. Display open string names from the active tuning.
12. Make the visual layout clear enough for desktop and tablet.
13. The default orientation should show string 1 at the top and the lowest string at the bottom.

Validation:
- The component should render sample 6-string data in App.
- The component should render sample 7-string data in App.
- npm run build should pass.
- There should be no TypeScript errors.
```

---

## Prompt 4: Implement mode selector and practice layout

```txt
Implement the mode selection and shared practice layout.

Files:
- src/components/layout/PracticeLayout.tsx
- src/components/layout/SessionHeader.tsx
- src/components/layout/FeedbackPanel.tsx
- src/components/ModeSelector.tsx or similar
- src/components/settings/InstrumentSelector.tsx
- src/types/modes.ts
- update App.tsx

Modes:
- visualNote
- visualInterval
- findNotes
- intervalListening

Requirements:
1. App should keep the selected mode in React state.
2. App should keep the active instrument and tuning in React state.
3. InstrumentSelector should offer:
   - 6-string guitar, standard tuning
   - 7-string guitar, standard tuning
4. When the user changes instrument, update the active tuning and selected strings.
5. ModeSelector should show four mode cards:
   - Visual note training
   - Visual interval training
   - Find all notes
   - Interval listening
6. PracticeLayout should provide:
   - title
   - instructions
   - current instrument and tuning display
   - session stats area
   - main practice content
   - answer area
   - feedback area
7. SessionHeader should show:
   - total questions
   - correct
   - incorrect
   - current streak
8. FeedbackPanel should support:
   - neutral
   - correct
   - incorrect
9. Use placeholder content for modes not yet implemented.

Validation:
- The user can switch modes.
- The user can switch between 6-string and 7-string.
- Switching to 7-string visibly adds string 7 to the placeholder or sample fretboard.
- The layout stays stable.
- npm run build should pass.
```

---

## Prompt 5: Implement visual note training

```txt
Implement the Visual Note Training mode with both 6-string and 7-string support.

Files:
- src/modes/visualNote/VisualNoteMode.tsx
- src/modes/visualNote/generateVisualNoteQuestion.ts
- update App.tsx to render this mode
- reuse Fretboard component
- reuse music utilities

Requirements:
1. Generate a random fretboard position from:
   - active tuning
   - frets 0 to 12
   - selected strings for the active tuning
2. Support both standard 6-string and standard 7-string tunings.
3. Do not hardcode six strings.
4. Mark exactly one fretboard cell.
5. Ask: "What note is marked?"
6. Render note answer buttons:
   - C, C#, D, D#, E, F, F#, G, G#, A, A#, B
7. Accept enharmonic equivalents internally, but display sharp names for now.
8. On answer:
   - show correct or incorrect feedback
   - show the correct note name
   - show string number and fret
   - update session stats
9. Add a "Next question" button.
10. Avoid repeating the exact same string and fret immediately.
11. Keep all state inside the mode component for now.

Validation:
- Answering works.
- Feedback works.
- Score updates correctly.
- Questions can appear on string 7 when 7-string is active.
- Questions never appear on string 7 when 6-string is active.
- npm run build should pass.
```

---

## Prompt 6: Implement visual interval training

```txt
Implement the Visual Interval Training mode with both 6-string and 7-string support.

Files:
- src/modes/visualInterval/VisualIntervalMode.tsx
- src/modes/visualInterval/generateVisualIntervalQuestion.ts
- update App.tsx
- reuse Fretboard component
- reuse interval utilities

Requirements:
1. Generate a root position and a target position on the active fretboard.
2. Use active tuning, frets 0 to 12, and selected strings.
3. Support standard 6-string and standard 7-string tunings.
4. Do not hardcode six strings.
5. Only generate ascending intervals from P1 to P8.
6. The root and target must be real fretboard positions in the active tuning.
7. The target MIDI pitch must be greater than or equal to the root MIDI pitch.
8. The interval must be one of:
   - P1, m2, M2, m3, M3, P4, TT, P5, m6, M6, m7, M7, P8
9. Mark the root cell with a visible root label.
10. Mark the target cell with a question mark.
11. Ask: "What is the interval from the root to the marked note?"
12. Render interval answer buttons.
13. On answer:
   - show correct or incorrect feedback
   - show root note, target note, string numbers, frets, and interval name
   - update session stats
14. Add a "Next question" button.
15. Avoid generating identical root and target positions unless the interval is P1.
16. The generator must work by calculating available fretboard cells from the active tuning, then selecting valid root and target cells.

Important:
- Do not use modulo 12 for this first version.
- Use absolute MIDI distance.
- P8 means exactly 12 semitones.
- Seven-string support must include valid questions on string 7 when selected.

Validation:
- Every generated question should have a valid answer.
- No impossible questions.
- Questions can use string 7 when 7-string is active.
- Questions cannot use string 7 when 6-string is active.
- No TypeScript errors.
- npm run build should pass.
```

---

## Prompt 7: Add Find All Notes mode

```txt
Implement the Find All Notes mode with both 6-string and 7-string support.

Files:
- src/modes/findNotes/FindNotesMode.tsx
- src/modes/findNotes/generateFindNotesQuestion.ts
- src/modes/findNotes/evaluateFindNotesAnswer.ts
- update App.tsx
- reuse Fretboard component

Requirements:
1. Generate a target note from the 12 pitch classes.
2. Display the prompt:
   - "Find all [note] notes"
3. Render the fretboard for the active tuning, frets 0 to 12, and selected strings.
4. Support standard 6-string and standard 7-string tunings.
5. Do not hardcode six strings.
6. User can click cells to toggle selection.
7. Selected cells should have a distinct visual marker.
8. User submits the answer.
9. Evaluation should produce:
   - correctSelected
   - missed
   - wrongSelected
   - isPerfect
10. After submit:
   - correct selected cells show as correct
   - missed cells show as missed
   - wrong selected cells show as incorrect
11. Update session stats:
   - one submitted board equals one question
   - correct only if isPerfect is true
12. Add a "Next question" button.
13. Do not allow changing the selection after submit.
14. Correct positions should be calculated from the active tuning, selected strings, and fret range.

Validation:
- The evaluator should compare positions using stringNumber and fret.
- Correct answers should be deterministic.
- String 7 target notes are included when 7-string is active and string 7 is selected.
- String 7 is never included when 6-string is active.
- npm run build should pass.
```

---

## Prompt 8: Add interval listening with Web Audio API

```txt
Implement Interval Listening Practice using the Web Audio API with both 6-string and 7-string support.

Files:
- src/modes/intervalListening/IntervalListeningMode.tsx
- src/modes/intervalListening/generateListeningQuestion.ts
- src/modes/intervalListening/playInterval.ts
- update App.tsx
- reuse interval utilities and midiToFrequency

Requirements:
1. Generate a random root MIDI note based on the active instrument:
   - 6-string default root range: MIDI 40 to 72
   - 7-string default root range: MIDI 35 to 72
2. Generate an interval from:
   - P1, m2, M2, m3, M3, P4, TT, P5, m6, M6, m7, M7, P8
3. Calculate targetMidi = rootMidi + interval.semitones.
4. Ensure the target MIDI note stays within a reasonable configured range.
5. Use Web Audio API oscillators.
6. Implement playback modes:
   - melodicAscending: root, then target
   - harmonic: root and target together
7. Add a playback mode toggle.
8. Add a "Play" button.
9. Auto-play when a new question loads only after the user has interacted with the page once.
10. Render interval answer buttons.
11. On answer:
   - show correct or incorrect feedback
   - show the correct interval
   - show root MIDI and target MIDI for debugging or optional detail
   - update session stats
12. Add a "Next question" button.
13. Avoid overlapping playback when the user clicks Play repeatedly.
14. Use the active instrument to determine listening range.

Audio details:
- Use a short attack and release envelope.
- Keep volume moderate.
- Use oscillator type "triangle" by default.

Validation:
- Works in modern browsers.
- Does not require server audio files.
- 7-string mode can generate root notes down to B1, MIDI 35.
- 6-string mode should not generate root notes below E2, MIDI 40.
- npm run build should pass.
```

---

## Prompt 9: Add settings

```txt
Add a shared settings system for the guitar trainer with both 6-string and 7-string support.

Files:
- src/state/settingsStore.ts or React Context equivalent
- src/components/settings/SettingsPanel.tsx
- src/components/settings/InstrumentSelector.tsx
- src/components/settings/StringSelector.tsx
- update all implemented modes to read settings

Settings:
1. instrumentType:
   - sixStringGuitar
   - sevenStringGuitar
2. tuningId:
   - standard-6
   - standard-7
3. startFret
4. endFret
5. selectedStrings
6. accidentalPreference:
   - sharps
   - flats
7. showNoteNames
8. showStringNames
9. showFretNumbers
10. highStringOnTop
11. allowedIntervals
12. listeningPlaybackMode

Requirements:
- Use React state or Zustand.
- Keep settings front-end-only.
- Validate settings:
  - active tuning must match active instrument type
  - startFret must be >= 0
  - endFret must be greater than or equal to startFret
  - selectedStrings must not be empty
  - selectedStrings must all exist in the active tuning
  - allowedIntervals must not be empty
- Update Visual Note mode to use tuning, fret, and string settings.
- Update Visual Interval mode to use tuning, fret, string, and interval settings.
- Update Find All Notes mode to use tuning, fret, and string settings.
- Update Interval Listening mode to use active instrument and allowed interval settings.
- Add a settings button or panel visible from the main app.
- When switching from 7-string to 6-string, remove string 7 from selectedStrings.
- When switching from 6-string to 7-string, default selectedStrings to all seven strings unless the user has a saved seven-string selection.

Validation:
- Changing instrument changes the rendered fretboard.
- Changing fret range changes generated questions.
- Changing selected strings changes generated questions.
- Disabling string 7 prevents questions on string 7.
- Disabling an interval prevents it from appearing.
- npm run build should pass.
```

---

## Prompt 10: Persist settings and local progress

```txt
Persist settings and basic progress using localStorage.

Files:
- src/utils/localStorage.ts
- src/state/settingsStore.ts
- src/state/progressStore.ts or equivalent
- update modes to record progress

Requirements:
1. Persist settings under:
   - guitarTrainer.settings
2. Persist progress under:
   - guitarTrainer.progress
3. Progress should track:
   - total attempts
   - correct attempts
   - incorrect attempts
   - best streak
   - per interval attempts and correct count
   - per note attempts and correct count
   - per instrument attempts and correct count
   - per tuning attempts and correct count
   - per string attempts and correct count
4. Keep session stats separate from lifetime progress.
5. Include instrumentType and tuningId in progress events.
6. Add a reset progress button.
7. Add a reset settings button.
8. Handle invalid localStorage data safely:
   - catch JSON parse errors
   - fall back to defaults
   - do not crash the app
9. Validate loaded settings:
   - if saved tuningId does not exist, fall back to standard-6
   - if saved selectedStrings contain invalid strings for the active tuning, remove them
   - if selectedStrings becomes empty, select all strings for the active tuning

Validation:
- Refreshing the browser keeps settings.
- Refreshing the browser keeps lifetime progress.
- 7-string settings survive refresh.
- Switching instruments after refresh still works.
- Reset buttons work.
- npm run build should pass.
```

---

## Prompt 11: Add progress summary

```txt
Add a progress summary screen.

Files:
- src/components/progress/ProgressSummary.tsx
- update App.tsx or layout navigation

Requirements:
1. Show lifetime totals:
   - total attempts
   - correct attempts
   - accuracy percentage
   - best streak
2. Show instrument accuracy:
   - 6-string guitar
   - 7-string guitar
3. Show tuning accuracy:
   - standard-6
   - standard-7
4. Show interval accuracy table:
   - interval
   - attempts
   - correct
   - accuracy
5. Show note accuracy table:
   - note
   - attempts
   - correct
   - accuracy
6. Show string accuracy table:
   - instrument
   - tuning
   - string number
   - attempts
   - correct
   - accuracy
7. Show weak intervals:
   - lowest accuracy among intervals with at least 5 attempts
8. Show weak notes:
   - lowest accuracy among notes with at least 5 attempts
9. Show weak strings:
   - lowest accuracy among strings with at least 5 attempts
10. Add a reset progress button with confirmation.
11. Keep everything front-end-only.

Validation:
- The screen works with empty progress.
- The screen works with real progress.
- The screen works with both 6-string and 7-string progress.
- No division-by-zero bugs.
- npm run build should pass.
```

---

## Prompt 12: Add keyboard shortcuts

```txt
Add keyboard shortcuts for faster practice.

Requirements:
1. Number keys should select answer buttons.
2. Enter should go to the next question when feedback is visible.
3. Space should replay audio in Interval Listening mode.
4. Escape should clear selected cells in Find All Notes mode before submit.
5. Shortcuts should not trigger while the user is typing in an input.
6. Show shortcut hints on answer buttons.
7. Fretboard keyboard navigation should work for both 6-string and 7-string layouts.
8. Arrow key navigation on the fretboard should not assume six strings.

Validation:
- Keyboard shortcuts work in all modes.
- Shortcuts do not interfere with settings inputs.
- Fretboard navigation works on 6-string.
- Fretboard navigation works on 7-string.
- npm run build should pass.
```

---

## Prompt 13: Improve visual design and accessibility

```txt
Improve the visual design and accessibility of the app.

Requirements:
1. Make the fretboard visually clear on desktop and tablet.
2. Add responsive behavior for narrow screens.
3. Ensure all clickable cells are keyboard accessible.
4. Add visible focus states.
5. Use ARIA labels where useful.
6. Ensure color is not the only way to distinguish:
   - root
   - target
   - selected
   - correct
   - incorrect
   - missed
7. Add labels or symbols:
   - R for root
   - ? for target
   - ✓ for correct
   - ✕ for incorrect
   - ! for missed
8. Check that answer buttons are readable.
9. Keep the UI calm and practice-focused.
10. Ensure the 7-string fretboard does not feel cramped.
11. On small screens, allow horizontal fretboard scrolling if needed.
12. Keep string labels visible for both 6-string and 7-string layouts.

Validation:
- App remains usable with keyboard only.
- 6-string fretboard remains readable.
- 7-string fretboard remains readable.
- npm run build should pass.
```

---

## Prompt 14: Add tests for generation and evaluation logic

```txt
Add unit tests for the core generation and evaluation logic.

Test files:
- src/music/music.test.ts
- src/modes/visualNote/generateVisualNoteQuestion.test.ts
- src/modes/visualInterval/generateVisualIntervalQuestion.test.ts
- src/modes/findNotes/evaluateFindNotesAnswer.test.ts
- src/modes/intervalListening/generateListeningQuestion.test.ts

Requirements:
1. Test noteNameToPitchClass.
2. Test pitchClassToNoteName.
3. Test midiToFrequency for A4 = 440 Hz.
4. Test fretboard cell generation for standard 6-string tuning.
5. Test fretboard cell generation for standard 7-string tuning.
6. Test that standard 7-string tuning includes string 7 as B1, MIDI 35.
7. Test visual note questions only use selected strings and fret range.
8. Test visual note questions can use string 7 when standard 7-string is active.
9. Test visual note questions never use string 7 when standard 6-string is active.
10. Test visual interval questions:
   - use allowed intervals
   - use absolute MIDI distance
   - do not generate impossible questions
   - work on 6-string tuning
   - work on 7-string tuning
11. Test Find All Notes evaluator:
   - perfect answer
   - missed notes
   - wrong selections
   - mixed answer
   - includes string 7 positions when 7-string is active
12. Test listening questions:
   - targetMidi equals rootMidi plus interval semitones
   - allowed intervals are respected
   - 6-string default root range does not go below MIDI 40
   - 7-string default root range can go down to MIDI 35

Validation:
- npm test should pass.
- npm run build should pass.
```

---

## Prompt 15: Create an AGENTS.md file for Codex

```txt
Create an AGENTS.md file at the repository root for this project.

It should tell Codex:
- This is a front-end-only React + TypeScript + Vite app.
- Do not add a backend.
- Do not add API calls.
- Do not add a database.
- Keep all data local to the browser.
- Use localStorage only for persistence.
- Prefer strongly typed TypeScript.
- Avoid any types.
- Keep music theory logic in src/music.
- Keep tuning and instrument logic general enough for both 6-string and 7-string guitars.
- Do not hardcode six strings anywhere.
- Keep mode-specific logic in src/modes.
- Keep reusable UI in src/components.
- Run npm run build before finishing.
- Run npm test if tests exist.
- Do not introduce large dependencies without explaining why.
- Keep the app usable on desktop, tablet, and mobile.
```

OpenAI’s Codex guide states that `AGENTS.md` can be used for custom instructions in a repository, with more specific nested files able to override higher-level guidance. ([OpenAI Developers][3])

---

# 11. Suggested `AGENTS.md`

````md
# AGENTS.md

## Project

This is a front-end-only guitar fretboard trainer built with React, TypeScript, Vite, and Tailwind CSS.

The app supports both:

- 6-string guitar
- 7-string guitar

## Hard constraints

- Do not add a backend.
- Do not add API calls.
- Do not add a database.
- Do not add authentication.
- The app must run fully in the browser.
- Use localStorage only for persistence.
- Do not introduce large dependencies without a clear reason.

## Architecture

- Core music theory logic belongs in `src/music`.
- Instrument and tuning logic belongs in `src/music/tunings.ts` and `src/music/instruments.ts`.
- Mode-specific logic belongs in `src/modes`.
- Reusable UI components belong in `src/components`.
- Shared types belong in `src/types`.
- Local storage helpers belong in `src/utils`.
- Shared app state belongs in `src/state`.

## TypeScript

- Prefer strict TypeScript.
- Avoid `any`.
- Use explicit domain types for notes, intervals, fretboard positions, tunings, instruments, and modes.
- Throw clear errors for invalid music theory inputs.

## Instrument support

The app must support both 6-string and 7-string guitars from the beginning.

Do not hardcode six strings anywhere.

Use the active tuning as the source of truth for:

- string count
- string numbers
- open string names
- open string MIDI notes
- selected strings
- fretboard rendering
- question generation
- answer evaluation
- progress tracking

## Default tunings

Standard 6-string tuning:

- string 6: E2, MIDI 40
- string 5: A2, MIDI 45
- string 4: D3, MIDI 50
- string 3: G3, MIDI 55
- string 2: B3, MIDI 59
- string 1: E4, MIDI 64

Standard 7-string tuning:

- string 7: B1, MIDI 35
- string 6: E2, MIDI 40
- string 5: A2, MIDI 45
- string 4: D3, MIDI 50
- string 3: G3, MIDI 55
- string 2: B3, MIDI 59
- string 1: E4, MIDI 64

## Validation

Before completing a task, run:

```bash
npm run build
````

If tests exist, also run:

```bash
npm test
```

## Product constraints

The app has four training modes:

1. Visual note training
2. Visual interval training
3. Find all notes on fretboard
4. Interval listening practice

The first version should support:

* Standard 6-string tuning
* Standard 7-string tuning
* Instrument selector
* Six-string and seven-string fretboard rendering
* Frets 0 to 12
* Sharp note names by default
* Front-end-only progress tracking

````

---

# 12. Important product decisions to make early

## Interval naming

Use this as the initial answer set:

| Semitones | Short | Name |
|---:|---|---|
| 0 | P1 | Unison |
| 1 | m2 | Minor 2nd |
| 2 | M2 | Major 2nd |
| 3 | m3 | Minor 3rd |
| 4 | M3 | Major 3rd |
| 5 | P4 | Perfect 4th |
| 6 | TT | Tritone |
| 7 | P5 | Perfect 5th |
| 8 | m6 | Minor 6th |
| 9 | M6 | Major 6th |
| 10 | m7 | Minor 7th |
| 11 | M7 | Major 7th |
| 12 | P8 | Octave |

## Enharmonic handling

Internally, store pitch classes.  
For display, use the selected preference:

```txt
Sharps: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
Flats:  C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B
````

For answer checking, accept both unless the user explicitly chooses strict spelling later.

## Visual interval ambiguity

A pair of fretboard notes can be interpreted in multiple ways:

```txt
C to G = perfect fifth
G to C = perfect fourth if measured upward by pitch class
G down to C = descending perfect fifth
C to higher G = perfect fifth
C to much higher G = compound interval
```

For version 1, avoid this complexity:

```txt
Only generate target MIDI pitches greater than or equal to root MIDI pitches.
Only train P1 through P8.
Use absolute semitone distance.
```

Later, add:

```txt
descending intervals
compound intervals
inversions
pitch-class-only mode
```

## Seven-string-specific ambiguity

Seven-string guitars add the low B string, which creates more duplicated pitches and more possible interval shapes.

For example, the same pitch may appear in more places:

```txt
B1: string 7, fret 0
E2: string 6, fret 0 and string 7, fret 5
A2: string 5, fret 0 and string 6, fret 5 and string 7, fret 10
```

That is useful for training but important for generation and evaluation:

```txt
Visual note training:
- one marked position means one answer

Visual interval training:
- one root and one target position means one answer

Find all notes:
- every valid occurrence on selected strings must be included
```

---

# 13. MVP build order

Use this order:

```txt
1. Project scaffold
2. Music theory utilities with 6-string and 7-string tunings
3. Reusable dynamic fretboard
4. Instrument selector
5. Shared practice layout
6. Visual note training
7. Visual interval training
8. Find all notes
9. Settings
10. localStorage persistence
11. Interval listening
12. Progress summary
13. Keyboard shortcuts
14. Accessibility and polish
15. Tests
```

I would not start with audio. The visual fretboard and music model are the foundation. Once those are correct, the listening mode is relatively isolated.

[1]: https://developers.openai.com/codex/prompting?utm_source=chatgpt.com "Prompting – Codex"
[2]: https://developers.openai.com/codex/learn/best-practices?utm_source=chatgpt.com "Best practices – Codex"
[3]: https://developers.openai.com/codex/guides/agents-md?utm_source=chatgpt.com "Custom instructions with AGENTS.md – Codex"

