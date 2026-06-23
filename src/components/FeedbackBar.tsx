import { Button } from './Button';

const PRAISE = ['Nice! 🎉', 'Perfect! 🌟', 'Correct! 💚', 'You got it! ✨', 'Spot on! 🙌'];

interface Props {
  correct: boolean;
  /** Shown when wrong, e.g. "namaskaaram = Hello". */
  answerText?: string;
  /** Consecutive-correct count, for the combo flair. */
  combo?: number;
  isLast?: boolean;
  onContinue: () => void;
}

/** The encouraging result bar shown after answering any exercise. */
export function FeedbackBar({ correct, answerText, combo = 0, isLast, onContinue }: Props) {
  const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
  return (
    <div className="sticky bottom-24 mt-5 animate-[pop_0.25s_ease-out]">
      <div
        className={`rounded-3xl border-2 p-4 ${
          correct ? 'border-teal-300 bg-teal-50' : 'border-gold-400 bg-gold-300/20'
        }`}
      >
        {correct ? (
          <div className="flex items-center justify-between">
            <p className="font-semibold text-teal-800">{praise}</p>
            {combo >= 3 && (
              <span className="rounded-full bg-coral-400/20 px-2.5 py-1 text-sm font-bold text-coral-500">
                🔥 {combo} in a row
              </span>
            )}
          </div>
        ) : (
          <div>
            <p className="font-semibold text-gold-600">Almost! Here's the answer:</p>
            {answerText && <p className="mt-1 text-ink">{answerText}</p>}
          </div>
        )}
        <Button className="mt-3 w-full" onClick={onContinue}>
          {isLast ? 'See results' : 'Continue'} →
        </Button>
      </div>
    </div>
  );
}
