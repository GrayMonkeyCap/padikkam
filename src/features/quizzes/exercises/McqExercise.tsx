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
      <p className="mb-2 text-sm font-medium text-ink/40">{heading}</p>

      <Card className="mb-5 flex min-h-[7rem] items-center justify-center text-center">
        {item.kind === 'listen' ? (
          <AudioButton clipId={item.audioClip!} fallbackText={item.fallbackText} size="lg" />
        ) : (
          <div>
            <div className="text-2xl font-bold text-teal-900">{item.promptRoman ?? item.promptEn}</div>
            {item.promptDeva && (
              <div className="mt-1 text-base text-teal-700/70" lang="hi">
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
            idle: 'border-teal-100 bg-white hover:border-teal-300',
            correct: 'border-teal-500 bg-teal-50 text-teal-900',
            wrong: 'border-coral-400 bg-coral-400/10 text-ink animate-[wiggle_0.4s_ease-in-out]',
            dim: 'border-teal-100 bg-white opacity-50',
          }[state];
          return (
            <button
              key={opt}
              onClick={() => !answered && setPicked(opt)}
              disabled={answered}
              className={`flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3.5 text-left font-medium transition ${styles}`}
            >
              <span>{opt}</span>
              {answered && opt === item.answer && <span>✓</span>}
              {answered && opt === picked && opt !== item.answer && <span>✕</span>}
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
