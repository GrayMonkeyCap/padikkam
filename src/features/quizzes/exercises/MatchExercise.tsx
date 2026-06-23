import { useMemo, useState } from 'react';
import type { MatchItem } from '../generate';
import { FeedbackBar } from '../../../components/FeedbackBar';

interface Props {
  item: MatchItem;
  combo: number;
  isLast: boolean;
  onComplete: (correct: boolean) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Tap a Malayalam tile then its English meaning. Fast recognition drill. */
export function MatchExercise({ item, combo, isLast, onComplete }: Props) {
  const left = useMemo(() => shuffle(item.pairs), [item]);
  const right = useMemo(() => shuffle(item.pairs), [item]);

  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [wrongCount, setWrongCount] = useState(0);

  const done = matched.size === item.pairs.length;

  const tapRight = (phraseId: string) => {
    if (!selected || matched.has(phraseId)) return;
    if (selected === phraseId) {
      setMatched((m) => new Set(m).add(phraseId));
      setSelected(null);
    } else {
      setWrongFlash(phraseId);
      setWrongCount((c) => c + 1);
      setTimeout(() => setWrongFlash(null), 400);
      setSelected(null);
    }
  };

  const tile = (active: boolean, matchedState: boolean, wrong: boolean) =>
    `rounded-2xl border-2 px-3 py-4 text-center font-medium transition ${
      matchedState
        ? 'border-teal-200 bg-teal-50 text-teal-400 opacity-50'
        : wrong
          ? 'border-coral-400 bg-coral-400/10 animate-[wiggle_0.4s_ease-in-out]'
          : active
            ? 'border-teal-600 bg-teal-100 text-teal-900'
            : 'border-teal-100 bg-white text-teal-900 hover:border-teal-300'
    }`;

  return (
    <div className="flex min-h-[70vh] flex-col">
      <p className="mb-4 text-sm font-medium text-ink/40">Match the pairs</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">
          {left.map((p) => (
            <button
              key={p.phraseId}
              disabled={matched.has(p.phraseId)}
              onClick={() => !matched.has(p.phraseId) && setSelected(p.phraseId)}
              className={tile(selected === p.phraseId, matched.has(p.phraseId), false)}
            >
              {p.roman}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {right.map((p) => (
            <button
              key={p.phraseId}
              disabled={matched.has(p.phraseId)}
              onClick={() => tapRight(p.phraseId)}
              className={tile(false, matched.has(p.phraseId), wrongFlash === p.phraseId)}
            >
              {p.english}
            </button>
          ))}
        </div>
      </div>

      {done && (
        <FeedbackBar
          correct={wrongCount === 0}
          answerText={wrongCount > 0 ? 'All matched — review the tricky ones above.' : undefined}
          combo={combo + 1}
          isLast={isLast}
          onContinue={() => onComplete(wrongCount === 0)}
        />
      )}
    </div>
  );
}
