# AGENTS.md

Guidance for Codex and other coding agents working in this repository.

## Project Type

This is a front-end-only React + TypeScript + Vite app for a guitar fretboard trainer.

Do not add:
- a backend
- API calls
- a database
- server-side persistence

Keep all data local to the browser. Use `localStorage` only for persistence.

## TypeScript

Prefer strongly typed TypeScript throughout the app.

Avoid `any` types. If a value is unknown, model it with `unknown`, narrow it explicitly, or add a specific type.

## Architecture

Keep music theory logic in `src/music`.

Keep tuning and instrument logic general enough for both 6-string and 7-string guitars. Do not hardcode six strings anywhere. Code should derive string count and string numbers from the active tuning/instrument model.

Keep mode-specific training logic in `src/modes`.

Keep reusable UI in `src/components`.

## Dependencies

Do not introduce large dependencies without explaining why they are necessary and why a smaller/local implementation is not sufficient.

## UX

Keep the app usable on desktop, tablet, and mobile.

Maintain keyboard accessibility and visible focus states for interactive controls.

## Validation

Before finishing changes, run:

```bash
npm run build
```

Run tests if they exist:

```bash
npm test
```
