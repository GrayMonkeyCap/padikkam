import type { SrsState } from '../storage/repository';
import { phrases, orderedLessons, phrasesForLesson } from '../content';
import type { Phrase } from '../content/types';

/**
 * Build review/learning queues from SRS state.
 *
 * "New" phrases are those never reviewed. We introduce them in curriculum order
 * (lesson by lesson) so beginners aren't dumped random vocabulary.
 */

const phraseLearnOrder: Phrase[] = orderedLessons.flatMap((l) => phrasesForLesson(l.id));
// Append any phrases not in a lesson, just in case.
for (const p of phrases) if (!phraseLearnOrder.includes(p)) phraseLearnOrder.push(p);

export interface QueueOptions {
  /** Max new phrases to introduce in this session. */
  newLimit?: number;
  /** Max total cards in the session. */
  sessionLimit?: number;
}

/** Phrase ids whose review time has arrived. */
export function duePhraseIds(srs: SrsState, now = Date.now()): string[] {
  return Object.entries(srs)
    .filter(([, card]) => card.due <= now)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([id]) => id);
}

/** Count of cards due right now (for the dashboard badge). */
export function dueCount(srs: SrsState, now = Date.now()): number {
  return duePhraseIds(srs, now).length;
}

/** Phrases never introduced yet, in curriculum order. */
export function newPhrases(srs: SrsState): Phrase[] {
  return phraseLearnOrder.filter((p) => !(p.id in srs));
}

/**
 * The session queue: due reviews first, then a capped number of new phrases.
 * Returns phrases (not just ids) ready to render as flashcards.
 */
export function buildSession(srs: SrsState, opts: QueueOptions = {}, now = Date.now()): Phrase[] {
  const { newLimit = 8, sessionLimit = 30 } = opts;

  const due = duePhraseIds(srs, now)
    .map((id) => phrases.find((p) => p.id === id))
    .filter((p): p is Phrase => Boolean(p));

  const fresh = newPhrases(srs).slice(0, newLimit);

  return [...due, ...fresh].slice(0, sessionLimit);
}
