import type { Phrase } from '../../content/types';
import { phrases as allPhrases, phraseAudioId } from '../../content';

/** A quiz is a sequence of these exercise items. */
export type QuizItem = McqItem | BuildItem | MatchItem;

export interface McqItem {
  type: 'mcq';
  kind: 'mal2en' | 'en2mal' | 'listen';
  phraseId: string;
  /** What to show in the prompt card. */
  promptRoman?: string;
  promptDeva?: string;
  promptEn?: string;
  audioClip?: string;
  fallbackText?: string;
  options: string[];
  answer: string;
}

export interface BuildItem {
  type: 'build';
  phraseId: string;
  promptEn: string;
  deva: string;
  /** Correct ordering of word tiles. */
  tokens: string[];
  /** Shuffled tokens plus a few distractor words. */
  bank: string[];
}

export interface MatchItem {
  type: 'match';
  pairs: { phraseId: string; roman: string; english: string }[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function distractors(pool: Phrase[], correct: Phrase, pick: (p: Phrase) => string, n = 3): string[] {
  const correctVal = pick(correct);
  const others = shuffle(pool.filter((p) => p.id !== correct.id && pick(p) !== correctVal));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of others) {
    const v = pick(p);
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
    if (out.length >= n) break;
  }
  return out;
}

/** Every distinct roman word across the corpus — used as build-mode distractor tiles. */
const allWords = Array.from(
  new Set(
    allPhrases
      .flatMap((p) => p.roman.split(/\s+/))
      .map((w) => w.trim())
      .filter((w) => w && !w.includes('___')),
  ),
);

function makeMcq(phrase: Phrase, kind: McqItem['kind']): McqItem {
  if (kind === 'en2mal') {
    const answer = phrase.roman;
    return {
      type: 'mcq',
      kind,
      phraseId: phrase.id,
      promptEn: phrase.english,
      options: shuffle([answer, ...distractors(allPhrases, phrase, (p) => p.roman)]),
      answer,
    };
  }
  if (kind === 'listen') {
    const answer = phrase.english;
    return {
      type: 'mcq',
      kind,
      phraseId: phrase.id,
      audioClip: phraseAudioId(phrase),
      fallbackText: phrase.script ?? phrase.roman,
      options: shuffle([answer, ...distractors(allPhrases, phrase, (p) => p.english)]),
      answer,
    };
  }
  const answer = phrase.english;
  return {
    type: 'mcq',
    kind: 'mal2en',
    phraseId: phrase.id,
    promptRoman: phrase.roman,
    promptDeva: phrase.deva,
    options: shuffle([answer, ...distractors(allPhrases, phrase, (p) => p.english)]),
    answer,
  };
}

const isBuildable = (p: Phrase) => {
  const words = p.roman.split(/\s+/);
  return !p.roman.includes('___') && words.length >= 2 && words.length <= 5;
};

function makeBuild(phrase: Phrase): BuildItem {
  const tokens = phrase.roman.split(/\s+/);
  const extra = shuffle(allWords.filter((w) => !tokens.includes(w))).slice(0, 3);
  return {
    type: 'build',
    phraseId: phrase.id,
    promptEn: phrase.english,
    deva: phrase.deva,
    tokens,
    bank: shuffle([...tokens, ...extra]),
  };
}

function makeMatch(group: Phrase[]): MatchItem {
  return {
    type: 'match',
    pairs: group.map((p) => ({ phraseId: p.id, roman: p.roman, english: p.english })),
  };
}

/**
 * Generate a mixed quiz from a phrase pool. Rotates recognition (MCQ),
 * production (build), and a matching round for variety and depth.
 */
export function generateQuiz(pool: Phrase[], count = 9): QuizItem[] {
  const usable = pool.length >= 4 ? pool : allPhrases;
  const chosen = shuffle(usable).slice(0, Math.min(count, usable.length));
  const items: QuizItem[] = [];
  const mcqKinds: McqItem['kind'][] = ['mal2en', 'en2mal', 'listen'];

  chosen.forEach((phrase, i) => {
    // Every 4th slot, drop in a matching round (needs 4 phrases).
    if (i > 0 && i % 4 === 0 && usable.length >= 4) {
      items.push(makeMatch(shuffle(usable).slice(0, 4)));
    }
    // Mix in a build exercise for buildable phrases (~every 3rd).
    if (i % 3 === 2 && isBuildable(phrase)) {
      items.push(makeBuild(phrase));
    } else {
      items.push(makeMcq(phrase, mcqKinds[i % mcqKinds.length]));
    }
  });

  return items;
}

/** Build a focused quiz from a specific list of phrases (e.g. the mistakes deck). */
export function quizFromPhrases(phrases: Phrase[], count = 12): QuizItem[] {
  return generateQuiz(phrases, count);
}
