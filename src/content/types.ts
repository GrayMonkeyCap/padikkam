/**
 * Content model for Padikkam.
 *
 * Everything the learner sees is data. Authors edit the JSON files in this folder;
 * the app stays generic. Quizzes are GENERATED from phrases — no separate authoring.
 *
 * Pronunciation is shown three ways so a Hindi+English speaker can lock it in fast:
 *   - roman : Latin transliteration (e.g. "സുഖമാണോ" -> "sukhamaano")
 *   - deva  : Devanagari pronunciation (e.g. "सुഖമാणോ" -> "सुഖमाणो") — Hindi readers sound this out natively
 *   - english / hindi : meaning bridges
 */

export type PartOfSpeech =
  | 'greeting'
  | 'phrase'
  | 'noun'
  | 'verb'
  | 'pronoun'
  | 'question'
  | 'number'
  | 'adjective'
  | 'connector';

export interface Phrase {
  id: string;
  /** Latin transliteration of the Malayalam. */
  roman: string;
  /** Devanagari pronunciation aid (for Hindi readers). */
  deva: string;
  /** Native Malayalam script — optional, reserved for a future reading track. */
  script?: string;
  /** English meaning. */
  english: string;
  /** Hindi meaning (bridge language). */
  hindi: string;
  /** Optional word-for-word literal gloss in English. */
  literal?: string;
  pos?: PartOfSpeech;
  tags?: string[];
  /** Lower = more frequent / learn earlier. Drives ordering when present. */
  frequencyRank?: number;
  /** Clip id -> /audio/<audio>.mp3. Defaults to `id` if omitted. */
  audio?: string;
  /** Short usage tip (English/Hindi) shown on the flashcard back. */
  notes?: string;
}

export interface DialogueLine {
  /** Speaker label, e.g. "A" / "B" or a name. */
  speaker: string;
  roman: string;
  deva: string;
  english: string;
  hindi: string;
  audio?: string;
}

export interface Dialogue {
  id: string;
  scenario: string;
  /** One-line setup shown before the conversation, in English. */
  setup: string;
  lines: DialogueLine[];
}

export interface Lesson {
  id: string;
  unit: string;
  order: number;
  title: string;
  /** What the learner will be able to say/do after this lesson. */
  goal: string;
  emoji: string;
  phraseIds: string[];
  dialogueIds: string[];
}

export interface Unit {
  id: string;
  order: number;
  title: string;
  description: string;
  emoji: string;
}

export interface TipExample {
  roman: string;
  deva: string;
  english: string;
}

export interface TipPoint {
  heading: string;
  body: string;
  examples?: TipExample[];
}

export interface Tip {
  title: string;
  intro?: string;
  points: TipPoint[];
}
