import { useState } from 'react';
import type { McqItem } from '../generate';
import { getPhrase } from '../../../content';
import { Card } from '../../../components/Card';
import { AudioButton } from '../../../components/AudioButton';
import { FeedbackBar } from '../../../components/FeedbackBar';

interface Props {
  item: McqItem;
  combo: number;
  isLast: boolean;
  onComplete: (correct: boolean) => void;
}

export function McqExercise({ item, combo, isLast, onComplete }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const answered = picked !== null;
  const correct = picked === item.answer;
  const phrase = getPhrase(item.phraseId);

  const heading =
    item.kind === 'listen'
      ? 'Listen and choose the meaning'
      : item.kind === 'en2mal'
        ? 'How do you say this in Malayalam?'
        : 'What does this mean?';

  return (
    <div className="flex min-h-[70vh] flex-col">
      <p className="mb-2 text-sm font-display font-medium text-ink-faint">{heading}</p>

      <Card className="mb-5 flex min-h-[7rem] items-center justify-center text-center">
        {item.kind === 'listen' ? (
          <AudioButton clipId={item.audioClip!} fallbackText={item.fallbackText} size="lg" />
        ) : (
          <div>
            <div className="font-display text-2xl font-bold text-ink">{item.promptRoman ?? item.promptEn}</div>
            {item.promptDeva && (
              <div className="mt-1 text-base text-ink-muted" lang="hi">
                {item.promptDeva}
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="space-y-2.5">
        {item.options.map((opt) => {
          const state = !answered
            ? 'idle'
            : opt === item.answer
              ? 'correct'
              : opt === picked
                ? 'wrong'
                : 'dim';
          const styles = {
            idle: 'border-border bg-surface-card shadow-[0_4px_0_var(--color-border)] hover:border-primary/30',
            correct: 'border-success bg-success-soft text-success-deep shadow-none translate-y-[2px]',
            wrong: 'border-warning bg-warning-soft text-warning-deep shadow-none translate-y-[2px] animate-wiggle',
            dim: 'border-border bg-surface-card opacity-40 shadow-none',
          }[state];
          return (
            <button
              key={opt}
              onClick={() => !answered && setPicked(opt)}
              disabled={answered}
              className={`flex w-full items-center justify-between rounded-full border-2 px-5 py-3.5 text-left font-display font-medium transition ${styles}`}
            >
              <span>{opt}</span>
              {answered && opt === item.answer && (
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
              )}
              {answered && opt === picked && opt !== item.answer && (
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--color-warning-deep)" strokeWidth={3} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <FeedbackBar
          correct={correct}
          answerText={phrase ? `${phrase.roman} = ${phrase.english}` : undefined}
          combo={combo + 1}
          isLast={isLast}
          onContinue={() => onComplete(correct)}
        />
      )}
    </div>
  );
}
