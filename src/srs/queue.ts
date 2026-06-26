import type { SrsState } from '../storage/repository';
import { phrases, orderedLessons, phrasesForLesson } from '../content';
import type { Phrase } from '../content/types';

const phraseLearnOrder: Phrase[] = orderedLessons.flatMap((l) => phrasesForLesson(l.id));
for (const p of phrases) if (!phraseLearnOrder.includes(p)) phraseLearnOrder.push(p);

/** Set of phrase IDs belonging to the given completed lessons. */
function completedPhraseIds(completedLessons: string[]): Set<string> {
  const ids = new Set<string>();
  for (const lid of completedLessons) {
    for (const p of phrasesForLesson(lid)) ids.add(p.id);
  }
  return ids;
}

export interface QueueOptions {
  /** Max total cards in the session. */
  sessionLimit?: number;
  /** Only include phrases from these completed lessons. */
  completedLessons?: string[];
}

/** Phrase ids whose review time has arrived. */
export function duePhraseIds(srs: SrsState, completedLessons?: string[], now = Date.now()): string[] {
  const allowed = completedLessons ? completedPhraseIds(completedLessons) : null;
  return Object.entries(srs)
    .filter(([id, card]) => card.due <= now && (!allowed || allowed.has(id)))
    .sort((a, b) => a[1].due - b[1].due)
    .map(([id]) => id);
}

/** Count of cards due right now (for the dashboard badge). */
export function dueCount(srs: SrsState, completedLessons?: string[], now = Date.now()): number {
  return duePhraseIds(srs, completedLessons, now).length;
}

/** Phrases never introduced yet, in curriculum order, filtered to completed lessons. */
export function newPhrases(srs: SrsState, completedLessons?: string[]): Phrase[] {
  const allowed = completedLessons ? completedPhraseIds(completedLessons) : null;
  return phraseLearnOrder.filter((p) => !(p.id in srs) && (!allowed || allowed.has(p.id)));
}

/**
 * All phrases from completed lessons, ordered by SRS priority:
 * due cards first, then unseen, then reviewed-but-not-yet-due.
 */
export function buildSession(srs: SrsState, opts: QueueOptions = {}, now = Date.now()): Phrase[] {
  const { sessionLimit = 30, completedLessons } = opts;
  const allowed = completedLessons ? completedPhraseIds(completedLessons) : null;
  const pool = phraseLearnOrder.filter((p) => !allowed || allowed.has(p.id));

  const due: Phrase[] = [];
  const fresh: Phrase[] = [];
  const notDue: Phrase[] = [];

  for (const p of pool) {
    const card = srs[p.id];
    if (!card) fresh.push(p);
    else if (card.due <= now) due.push(p);
    else notDue.push(p);
  }

  due.sort((a, b) => (srs[a.id]?.due ?? 0) - (srs[b.id]?.due ?? 0));
  notDue.sort((a, b) => (srs[a.id]?.due ?? 0) - (srs[b.id]?.due ?? 0));

  return [...due, ...fresh, ...notDue].slice(0, sessionLimit);
}
