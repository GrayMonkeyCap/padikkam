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
  /** Max new phrases to introduce in this session. */
  newLimit?: number;
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
 * The session queue: due reviews first, then a capped number of new phrases.
 * Only includes phrases from completed lessons when completedLessons is provided.
 */
export function buildSession(srs: SrsState, opts: QueueOptions = {}, now = Date.now()): Phrase[] {
  const { newLimit = 8, sessionLimit = 30, completedLessons } = opts;

  const due = duePhraseIds(srs, completedLessons, now)
    .map((id) => phrases.find((p) => p.id === id))
    .filter((p): p is Phrase => Boolean(p));

  const fresh = newPhrases(srs, completedLessons).slice(0, newLimit);

  return [...due, ...fresh].slice(0, sessionLimit);
}
