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

/** Tap word tiles in order to construct the Malayalam sentence (production practice). */
export function BuildExercise({ item, combo, isLast, onComplete }: Props) {
  // Track bank tiles by index so duplicate words stay distinct.
  const [built, setBuilt] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const phrase = getPhrase(item.phraseId);

  const used = new Set(built);
  const answer = built.map((i) => item.bank[i]).join(' ');
  const correct = answer === item.tokens.join(' ');

  return (
    <div className="flex min-h-[70vh] flex-col">
      <p className="mb-2 text-sm font-medium text-ink/40">Build the Malayalam sentence</p>

      <Card className="mb-4 text-center">
        <div className="text-xl font-bold text-teal-900">{item.promptEn}</div>
      </Card>

      {/* Answer area */}
      <div className="mb-4 flex min-h-[3.5rem] flex-wrap content-start gap-2 rounded-2xl border-2 border-dashed border-teal-200 p-3">
        {built.length === 0 && <span className="text-sm text-ink/30">Tap words below…</span>}
        {built.map((bankIdx) => (
          <button
            key={bankIdx}
            onClick={() => !checked && setBuilt((b) => b.filter((x) => x !== bankIdx))}
            disabled={checked}
            className="rounded-xl bg-teal-700 px-3 py-2 font-medium text-white"
          >
            {item.bank[bankIdx]}
          </button>
        ))}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2">
        {item.bank.map((word, i) =>
          used.has(i) ? (
            <span key={i} className="rounded-xl border-2 border-teal-100 px-3 py-2 font-medium text-transparent">
              {word}
            </span>
          ) : (
            <button
              key={i}
              onClick={() => !checked && setBuilt((b) => [...b, i])}
              disabled={checked}
              className="rounded-xl border-2 border-teal-200 bg-white px-3 py-2 font-medium text-teal-900 transition active:scale-95 hover:border-teal-300"
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
            onClick={() => {
              setChecked(true);
              if (!correct && phrase) {
                /* mistake recorded by parent via onComplete */
              }
            }}
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
        <div className="mt-3 flex items-center justify-center gap-2 text-teal-700">
          <AudioButton clipId={phraseAudioId(phrase)} fallbackText={phrase.script ?? phrase.roman} size="sm" />
          <span className="text-sm">Hear it: {phrase.roman}</span>
        </div>
      )}
    </div>
  );
}
