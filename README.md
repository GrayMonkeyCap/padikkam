# Padikkam — Learn Conversational Malayalam

An encouraging, mobile-first web app for learning **spoken Malayalam**, built for people who
already know **English and Hindi**. No Malayalam script — every phrase is shown in **Latin
transliteration** *and* **Devanagari** (so Hindi readers can sound it out), with English and Hindi
meanings as bridges.

> _Padikkam_ (പഠിക്കാം) means "let's learn".

## Features

- **Lesson path** — 16 units / 32 lessons that unlock as you go, from greetings and emergencies
  to the workplace, household, transit, opinions, leisure, and an implicit past/present/future track.
- **Grammar pattern tips** — a "guidebook" on each lesson teaches the *productive* patterns
  (`enikku … venam`, the `-aano?` question ending, `illa` vs `alla`) so you can build your own
  sentences, not just memorise phrases.
- **Flashcards with spaced repetition** — an SM-2 scheduler decides what to revise and when.
- **Mixed quiz exercises** — recognition (multiple choice both ways), listening drills,
  **sentence-building** with a word bank (production!), and **matching pairs** — auto-generated
  from the phrase data with warm, re-teaching feedback.
- **Practice your mistakes** — anything you get wrong is collected into a dedicated review deck.
- **Pronunciation practice** — shadow the native clip: record yourself and compare (no server, no ASR).
- **Dialogues + role-play** — real conversations with audio; hide your side and practise replying.
- **Motivation, not punishment** — XP, daily streak with **streak freezes**, levels, **crowns**
  (level up each lesson 1–5), combo feedback, badges. No "hearts"/lives.
- **Works offline** — installable PWA; played audio is cached.

## Tech

Vite · React · TypeScript · Tailwind CSS v4 · Zustand · React Router · vite-plugin-pwa.
No backend in v1 — progress is stored in the browser behind a `StorageRepository` interface
(`src/storage/`), so accounts/sync can be added later without touching the UI.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

## Content

All learning content is editable data in `src/content/`:

- `phrases.json` — words/phrases (roman, deva, english, hindi, notes, frequencyRank…)
- `lessons.json` / `units.json` — how phrases are grouped into the learning path
- `dialogues.json` — conversational scenarios

Types live in `src/content/types.ts`. Quizzes are generated from phrases — no separate authoring.
The shipped set is a small seed; the full frequency-ranked curriculum is a separate workstream.

## Audio (Google TTS)

Audio is **pre-generated** into static MP3s — no API key needed.

```bash
npm run generate-audio      # writes public/audio/<id>.mp3 (incremental, idempotent)
```

Until clips are generated, the app falls back to the browser's built-in speech synthesis.
The generator uses Google Translate TTS for native Malayalam pronunciation.

## Project layout

```
src/
  content/    phrases/lessons/units/dialogues data + types + loader
  storage/    StorageRepository interface, localStorage impl, Zustand store
  srs/        SM-2 algorithm + session queue
  audio/      audio hook (MP3 + TTS fallback)
  features/   dashboard, lessons, flashcards, dialogues, quizzes, progress
  components/  shared UI (Button, Card, ProgressRing, AudioButton, …)
  lib/        xp/badges, dates
scripts/      generate-audio.ts (build-time, server-side only)
```
