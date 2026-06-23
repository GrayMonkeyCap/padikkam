import type { Phrase, Lesson, Unit, Dialogue, DialogueLine, Tip } from './types';
import unitsRaw from './units.json';
import phrasesRaw from './phrases.json';
import lessonsRaw from './lessons.json';
import dialoguesRaw from './dialogues.json';
import tipsRaw from './tips.json';

export const units: Unit[] = (unitsRaw as Unit[]).slice().sort((a, b) => a.order - b.order);
export const phrases: Phrase[] = phrasesRaw as Phrase[];
export const lessons: Lesson[] = lessonsRaw as Lesson[];
export const dialogues: Dialogue[] = dialoguesRaw as Dialogue[];

const phraseById = new Map(phrases.map((p) => [p.id, p]));
const lessonById = new Map(lessons.map((l) => [l.id, l]));
const dialogueById = new Map(dialogues.map((d) => [d.id, d]));
const unitById = new Map(units.map((u) => [u.id, u]));

export const getPhrase = (id: string): Phrase | undefined => phraseById.get(id);
export const getLesson = (id: string): Lesson | undefined => lessonById.get(id);
export const getDialogue = (id: string): Dialogue | undefined => dialogueById.get(id);
export const getUnit = (id: string): Unit | undefined => unitById.get(id);

/** Audio clip id for a phrase (defaults to the phrase id). */
export const phraseAudioId = (p: Phrase): string => p.audio ?? p.id;

/** Audio clip id for a dialogue line (stable, derived from position). */
export const lineAudioId = (dialogueId: string, index: number, line: DialogueLine): string =>
  line.audio ?? `${dialogueId}-l${index}`;

/** Lessons belonging to a unit, ordered. */
export const lessonsForUnit = (unitId: string): Lesson[] =>
  lessons.filter((l) => l.unit === unitId).sort((a, b) => a.order - b.order);

/** Flat, ordered list of lessons across all units — defines the learning path. */
export const orderedLessons: Lesson[] = units.flatMap((u) => lessonsForUnit(u.id));

/** Phrases in a lesson, in authored order. */
export const phrasesForLesson = (lessonId: string): Phrase[] => {
  const lesson = lessonById.get(lessonId);
  if (!lesson) return [];
  return lesson.phraseIds.map((id) => phraseById.get(id)).filter((p): p is Phrase => Boolean(p));
};

export const dialoguesForLesson = (lessonId: string): Dialogue[] => {
  const lesson = lessonById.get(lessonId);
  if (!lesson) return [];
  return lesson.dialogueIds.map((id) => dialogueById.get(id)).filter((d): d is Dialogue => Boolean(d));
};

/** Which lesson a phrase belongs to (first match). */
export const lessonForPhrase = (phraseId: string): Lesson | undefined =>
  lessons.find((l) => l.phraseIds.includes(phraseId));

const tips = tipsRaw as Record<string, Tip>;
/** Grammar/usage tip for a lesson, if one is authored. */
export const getTip = (lessonId: string): Tip | undefined => tips[lessonId];

export type { Phrase, Lesson, Unit, Dialogue, DialogueLine, Tip } from './types';
