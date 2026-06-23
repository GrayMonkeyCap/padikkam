# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
npm install
npm run dev          # Dev server: http://localhost:5173
npm run build        # Production build to dist/
npm run generate-audio  # Pre-generate audio clips (Google TTS, incremental)
npm run preview      # Preview the built app locally
```

## Core Architecture

Padikkam is a **content-driven, client-first learning platform**. The app is *not* a generic quiz engine—its design encodes specific pedagogy for Malayalam conversation.

### Three Architectural Pillars

1. **Content as the source of truth** — all phrases, lessons, dialogues, and grammar patterns live in JSON (`src/content/*.json`). The UI is almost entirely generated from this data. Editing content doesn't require code changes.

2. **Storage abstraction** — all progress (XP, streaks, SRS state, mistakes) flows through a `StorageRepository` interface (`src/storage/repository.ts`). Currently backed by localStorage, but this abstraction lets us swap in a remote backend (Supabase, REST API) without touching UI or logic code.

3. **Immutable, pre-generated audio** — no runtime API calls. Audio clips are generated at build time (`scripts/generate-audio.ts`), baked into the static bundle, and served as MP3s. Fallback to browser TTS until clips are ready. This keeps the app fast and offline-capable.

## Routing & Pages

React Router in `src/router.tsx` maps to six feature pages (plus a 404):

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | DashboardPage | Home: daily goal, streak, next lesson, review queue |
| `/learn` | LessonsPage | Lesson path: units → lessons (unlock progression visible) |
| `/learn/:lessonId` | LessonDetailPage | Lesson view: grammar tip, phrases, pronunciation practice, quiz link, mark-complete button |
| `/review` | FlashcardsPage | SM-2 flashcard review session (daily queue) |
| `/quiz/:lessonId` | QuizPage | Auto-generated mixed quiz: MCQ, build, match, listening |
| `/practice` | QuizPage | All-phrase quiz (same quiz engine, broader phrase pool) |
| `/practice/mistakes` | QuizPage | Review-only quiz of mistaken phrases (read from `progress.mistakes`) |
| `/dialogue/:dialogueId` | DialoguePage | Scenario player: play full conversation, tap breakdown, role-play mode |
| `/progress` | ProgressPage | Stats, badges, daily goal picker, streak freezes, reset button |

## Critical Design Patterns

### 1. Content Engine (`src/content/`)

All content is typed JSON + TypeScript types. The app reads and generates from this data.

**Files:**
- `types.ts` — `Phrase`, `Lesson`, `Unit`, `Dialogue`, `Tip` (immutable types exported as `as const`)
- `units.json` — 10 units (emoji, title, description, id)
- `lessons.json` — 19 lessons; each lesson lists `phraseIds`, `dialogueIds`, `tipId`, belongs to a `unit`
- `phrases.json` — 120+ phrases; each has `roman` (Latin), `deva` (Devanagari), `english`, `hindi`, `pos` (part of speech), `audio` (clip ID), `notes`, `frequencyRank`
- `dialogues.json` — 10 scenarios; each lists lines with `speaker`, `roman`, `deva`, `english`, `hindi`, `audio`
- `tips.json` — Grammar pattern guides; each teaches a productive pattern (e.g., "Saying 'I want': enikku…venam") with Hindi parallels and worked examples
- `index.ts` — Loader & getter functions: `getPhrase()`, `getLesson()`, `getTip()`, `phrasesForLesson()`, etc.

**Key decision:** Phrases and dialogues are **keyed by ID** (e.g., `p-vellam`, `d-teashop-l0`), not name. This allows content to be reordered, renamed, or reused without breaking code references.

### 2. Storage & Persistence (`src/storage/`)

All app state flows through a single interface to enable future account sync.

**Files:**
- `repository.ts` — `StorageRepository` interface defining `Progress` (xp, streak, streakFreezes, lessonLevels, mistakes, completedLessons, lessonMastery, badges, dailyGoal, todayXp) and `SrsCard` (SM-2 state)
- `localStorage.ts` — `LocalStorageRepository` impl; reads/writes two keys: `padikkam.progress.v1` and `padikkam.srs.v1`
- `store.ts` — Zustand store with selectors and actions: `addXp()`, `reviewPhrase()`, `completeLesson()`, `levelUpLesson()`, `recordMastery()`, `addMistake()`, `clearMistake()`, `setDailyGoal()`, `resetAll()`. Persists automatically via localStorage middleware.

**Pattern:** Components never call `localStorage` directly. All reads/writes go through `useStore()` selectors and actions. This makes testing and future migrations trivial.

### 3. SRS (Spaced Repetition) Engine (`src/srs/`)

SM-2 algorithm (public domain) powers the daily review queue.

**Files:**
- `sm2.ts` — Pure functions: `review(card, grade)` updates ease/interval/nextDue, `previewInterval(grade)` shows what the next interval will be. Grades: 'again'/'hard'/'good'/'easy'.
- `queue.ts` — `buildSession()` assembles today's review queue (due cards + new cards up to a limit). Helpers: `dueCount()`, `newPhrases()`, `isDue()`.

**Critical note:** SRS state is *global* (all cards across all lessons in one dict). There is no per-lesson SRS—a card's due date is independent of which lesson introduced it. This keeps the review queue fresh and prevents "lesson fatigue."

### 4. Quiz Generation & Exercises (`src/features/quizzes/`)

Quizzes are auto-generated from phrase data. No separate content authoring.

**Files:**
- `generate.ts` — `generateQuiz(phraseIds, exerciseCount)` creates a mixed item list. Each item can be:
  - **McqItem** — (3 variants) Malayalam→English, English→Malayalam, or listen-to-Malayalam
  - **BuildItem** — word-bank sentence construction: user taps tiles to arrange a Malayalam sentence
  - **MatchItem** — Malayalam↔English matching pairs (fast recognition drill)
  - Distractors are auto-selected from the phrase pool (avoid cognates/homophones)
- `QuizPage.tsx` — Orchestrates the quiz flow: renders items in sequence, tracks combo, calls `addMistake()`/`clearMistake()` on wrong/right, promotes lesson mastery on 60%+ score, shows crowns and results
- `exercises/McqExercise.tsx`, `BuildExercise.tsx`, `MatchExercise.tsx` — Individual exercise UIs

**Key pattern:** Quiz items are stateless; the parent `QuizPage` owns the quiz session state and controls flow.

### 5. Grammar Pattern Tips (`src/components/LessonTip.tsx`)

Each lesson can have a collapsible grammar "guidebook" that teaches productive patterns.

**Structure:** A tip has a title, intro paragraph, a list of teaching points (each with a heading and worked examples in roman/deva/english), and optionally a Hindi parallel. This teaches *generative* ability (e.g., "enikku [thing] venam" unlocks all wanting-phrases) rather than rote memorization.

**Design principle:** Tips are authored in `src/content/tips.json` and rendered by a single, reusable `LessonTip` component. Each tip is keyed by lesson ID.

### 6. Audio Pipeline (`src/audio/` + `scripts/generate-audio.ts`)

Audio is **pre-generated, static, and offline-safe**.

**Build-time:**
- `scripts/generate-audio.ts` (Node) reads `phrases.json` and `dialogues.json`, calls Google Translate TTS (`tl=ml` endpoint, free, no API key), writes MP3s to `public/audio/<id>.mp3` incrementally & idempotently.
- Stores a manifest of what's been generated (for fast repeated runs).

**Runtime:**
- `useAudio` hook in `src/audio/useAudio.ts` plays `/audio/<clipId>.mp3` via `<audio>` element.
- Falls back to browser `speechSynthesis` (Web Speech API) if clip doesn't exist (for phrases added after build).
- PWA caches audio clips offline.

**Important:** No API key is needed or used at runtime. All audio generation happens at build time, server-side.

## State Flow

```
User interaction (e.g., tap "Review")
  ↓
Component calls Zustand action (e.g., reviewPhrase(cardId, grade))
  ↓
Action updates Progress / SrsState in memory
  ↓
Zustand middleware auto-persists to localStorage
  ↓
Component re-renders via useStore selector
```

This is unidirectional. No two-way binding, no manual localStorage calls, no React context.

## Content Authoring Workflow

To add or edit content:

1. **Edit JSON:** `src/content/phrases.json`, `lessons.json`, `units.json`, etc.
2. **Run dev server:** `npm run dev`
3. **Browser hot-reloads** and renders new content immediately.
4. **Generate audio** (when ready): `npm run generate-audio`
5. **No code changes needed.** The app is entirely content-driven.

## Key Files to Know

- `src/main.tsx` — App entry point; Zustand store hydration from localStorage
- `src/router.tsx` — Route definitions
- `src/components/AppLayout.tsx` — Sticky bottom nav, badge count in Review button
- `src/features/dashboard/DashboardPage.tsx` — Home: daily goal, next lesson card, mistakes deck link
- `src/features/lessons/LessonsPage.tsx` — Lesson unlock progression (each lesson unlocks after the previous is complete)
- `src/lib/xp.ts` — XP calculations, badge definitions, level curve
- `src/lib/dates.ts` — Streak rollover logic (todayKey, daysBetween)
- `vite.config.ts` — PWA plugin config; offline audio caching

## Gotchas & Decisions

1. **Lesson unlock is linear.** A lesson unlocks only if the *previous* lesson in the global order is completed. This is enforced in `useUnlock()` in `LessonsPage.tsx`. There's no branching or optional lessons.

2. **SRS is global, not per-lesson.** A phrase's spaced repetition schedule is independent of the lesson that introduced it. This prevents "stuck" lessons and keeps the daily review queue fresh.

3. **Mistakes are sticky.** Once a phrase is added to `mistakes[]`, it stays there until the user reviews it correctly in a dedicated quiz (the `/practice/mistakes` route). This is intentional—forcing learners to revisit errors.

4. **Combo resets on wrong.** The "N in a row" combo shown during quizzes resets on the first wrong answer, then restarts. This is encouraging (celebrate winning streaks) without being harsh (no "you ruined it" feeling).

5. **Crowns per lesson, not per phrase.** `progress.lessonLevels` maps lesson ID → level (0–5). Reaching 60%+ mastery in a lesson quiz promotes it one level. This is meant to encourage lesson revisits (level them up, collect all crowns) rather than just finishing once.

6. **No accounts in v1.** All progress is in-browser. The `StorageRepository` interface is ready for a backend; when it comes, we'll swap `LocalStorageRepository` for `RemoteStorageRepository` and everything else stays the same.

## Testing Locally on Mobile

The app is mobile-first. To test on a physical device:

```bash
npm run dev
# Note the local IP (e.g., 192.168.x.x:5173)
# Visit that IP from your phone on the same WiFi network
```

The PWA can be installed on iOS/Android. Service worker caches assets and audio for offline use.

## Building & Deploying

```bash
npm run build          # Vite builds to dist/
npm run preview        # Serve dist/ locally to test the production build
```

The app is a static SPA with no backend. Deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages, S3+CloudFront, etc.). Vercel is recommended; see `vercel.json` in the root.

## Malayalam Teaching Decisions (Encoded in Content)

- **Latin romanization + Devanagari:** Every phrase shows both. Devanagari lets Hindi speakers sound out Malayalam natively.
- **Grammar patterns as generative rules:** Tips teach productive patterns (e.g., "enikku [X] venam" for wanting) so learners can build new sentences, not just memorize.
- **No Malayalam script:** The app is strictly for spoken, conversational Malayalam. Reading/writing is out of scope for v1.
- **Frequency-ranked progression:** Phrases are ranked by usage frequency so learners can speak immediately (greetings, basics, food, directions) rather than learning academic or rare words first.
- **Hindi as a bridge:** Hindi meanings and grammar parallels are included because the user base (people who know Hindi) can leverage existing knowledge to learn faster.

## Future Work

- **Accounts & sync:** Swap `LocalStorageRepository` for a remote backend. No UI changes needed.
- **Speech recognition (ASR):** For pronunciation scoring; currently only client-side recording/comparison (no server ASR).
- **Native Malayalam script track:** A separate learning path for people who want to read/write.
- **Full frequency-ranked curriculum:** The shipped content is a seed. Real curriculum requires linguistics research and content authoring.
- **Native romanization review:** Retroflex and ഴ/zh sounds need a native speaker pass to ensure accuracy.
