import { useState } from 'react';
import type { BuildItem } from '../generate';
import { getPhrase, phraseAudioId } from '../../../content';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { AudioButton } from '../../../components/AudioButton';
import { FeedbackBar } from '../../../components/FeedbackBar';

interface Props {
  item: BuildItem;
  combo: number;
  isLast: boolean;
  onComplete: (correct: boolean) => void;
}

export function BuildExercise({ item, combo, isLast, onComplete }: Props) {
  const [built, setBuilt] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const phrase = getPhrase(item.phraseId);

  const used = new Set(built);
  const answer = built.map((i) => item.bank[i]).join(' ');
  const correct = answer === item.tokens.join(' ');

  return (
    <div className="flex min-h-[70vh] flex-col">
      <p className="mb-2 text-sm font-display font-medium text-ink-faint">Build the Malayalam sentence</p>

      <Card className="mb-4 text-center">
        <div className="font-display text-xl font-bold text-ink">{item.promptEn}</div>
      </Card>

      {/* Answer area */}
      <div className="mb-4 flex min-h-[3.5rem] flex-wrap content-start gap-2 rounded-[18px] border-2 border-dashed border-primary/30 bg-primary-soft/30 p-3">
        {built.length === 0 && <span className="text-sm text-ink-faint">Tap words below…</span>}
        {built.map((bankIdx) => (
          <button
            key={bankIdx}
            onClick={() => !checked && setBuilt((b) => b.filter((x) => x !== bankIdx))}
            disabled={checked}
            className="rounded-full bg-primary px-4 py-2 font-display font-medium text-white shadow-[0_3px_0_var(--color-primary-deep)] active:translate-y-[2px] active:shadow-none"
          >
            {item.bank[bankIdx]}
          </button>
        ))}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2">
        {item.bank.map((word, i) =>
          used.has(i) ? (
            <span key={i} className="rounded-full border-2 border-border px-4 py-2 font-display font-medium text-transparent">
              {word}
            </span>
          ) : (
            <button
              key={i}
              onClick={() => !checked && setBuilt((b) => [...b, i])}
              disabled={checked}
              className="rounded-full border-2 border-border bg-surface-card px-4 py-2 font-display font-medium text-ink shadow-[0_3px_0_var(--color-border)] transition active:translate-y-[2px] active:shadow-none hover:border-primary/30"
            >
              {word}
            </button>
          ),
        )}
      </div>

      {!checked ? (
        <div className="sticky bottom-24 mt-6">
          <Button
            size="lg"
            className="w-full"
            disabled={built.length === 0}
            onClick={() => setChecked(true)}
          >
            Check
          </Button>
        </div>
      ) : (
        <FeedbackBar
          correct={correct}
          answerText={phrase ? `${phrase.roman} = ${phrase.english}` : undefined}
          combo={combo + 1}
          isLast={isLast}
          onContinue={() => onComplete(correct)}
        />
      )}

      {checked && phrase && (
        <div className="mt-3 flex items-center justify-center gap-2 text-primary-deep">
          <AudioButton clipId={phraseAudioId(phrase)} fallbackText={phrase.script ?? phrase.roman} size="sm" />
          <span className="text-sm font-display">Hear it: {phrase.roman}</span>
        </div>
      )}
    </div>
  );
}
