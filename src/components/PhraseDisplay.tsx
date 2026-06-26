import type { Phrase } from '../content/types';
import { phraseAudioId } from '../content';
import { AudioButton } from './AudioButton';

interface Props {
  phrase: Phrase;
  showMeaning?: boolean;
  compact?: boolean;
}

export function PhraseDisplay({ phrase, showMeaning = true, compact = false }: Props) {
  return (
    <div className="flex items-start gap-4">
      <AudioButton
        clipId={phraseAudioId(phrase)}
        fallbackText={phrase.script ?? phrase.roman}
        size={compact ? 'sm' : 'md'}
      />
      <div className="min-w-0 flex-1">
        <div className={`font-display font-bold text-ink ${compact ? 'text-lg' : 'text-2xl'}`}>{phrase.roman}</div>
        <div className={`text-ink-muted ${compact ? 'text-sm' : 'text-lg'}`} lang="hi">
          {phrase.deva}
        </div>
        {showMeaning && (
          <div className="mt-2 space-y-0.5">
            <div className="font-medium text-ink">{phrase.english}</div>
            <div className="text-ink/60" lang="hi">
              {phrase.hindi}
            </div>
            {phrase.literal && (
              <div className="text-xs italic text-ink-faint">lit. "{phrase.literal}"</div>
            )}
            {phrase.notes && (
              <div className="mt-2 rounded-2xl bg-secondary-soft px-3 py-2 text-sm text-ink-muted">
                {phrase.notes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
