import type { Phrase } from '../content/types';
import { phraseAudioId } from '../content';
import { AudioButton } from './AudioButton';

interface Props {
  phrase: Phrase;
  /** Show the meanings (English/Hindi). Hidden on flashcard fronts. */
  showMeaning?: boolean;
  compact?: boolean;
}

/** Canonical way to render a phrase: audio + Latin + Devanagari + meanings. */
export function PhraseDisplay({ phrase, showMeaning = true, compact = false }: Props) {
  return (
    <div className="flex items-start gap-4">
      <AudioButton
        clipId={phraseAudioId(phrase)}
        fallbackText={phrase.script ?? phrase.roman}
        size={compact ? 'sm' : 'md'}
      />
      <div className="min-w-0 flex-1">
        <div className={`font-bold text-teal-900 ${compact ? 'text-lg' : 'text-2xl'}`}>{phrase.roman}</div>
        <div className={`text-teal-700/80 ${compact ? 'text-sm' : 'text-lg'}`} lang="hi">
          {phrase.deva}
        </div>
        {showMeaning && (
          <div className="mt-2 space-y-0.5">
            <div className="font-medium text-ink">{phrase.english}</div>
            <div className="text-ink/60" lang="hi">
              {phrase.hindi}
            </div>
            {phrase.literal && (
              <div className="text-xs italic text-ink/40">lit. “{phrase.literal}”</div>
            )}
            {phrase.notes && (
              <div className="mt-2 rounded-xl bg-gold-300/20 px-3 py-2 text-sm text-ink/70">
                💡 {phrase.notes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
