import { useEffect, useRef } from 'react';
import { Button } from './Button';
import { Ammu } from './Ammu';
import { playCorrect, playWrong } from '../audio/sounds';

const PRAISE = ['Kollaam!', 'Adipoli!', 'Sheri!', 'Correct!'];

interface Props {
  correct: boolean;
  answerText?: string;
  combo?: number;
  isLast?: boolean;
  onContinue: () => void;
}

export function FeedbackBar({ correct, answerText, combo = 0, isLast, onContinue }: Props) {
  const played = useRef(false);
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    if (correct) playCorrect(); else playWrong();
  }, [correct]);

  const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
  return (
    <div className="sticky bottom-24 mt-5 animate-pop">
      <div
        className={`rounded-[22px] border-2 p-4 ${
          correct ? 'border-success bg-success-soft' : 'border-warning bg-warning-soft'
        }`}
      >
        {correct ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ammu state="celebrating" size={48} />
              <p className="font-display font-bold text-success-deep">{praise}</p>
            </div>
            {combo >= 3 && (
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-sm font-bold text-accent">
                {combo} in a row
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <Ammu state="encouraging" size={48} />
            <div>
              <p className="font-display font-bold text-warning-deep">Almost! Here's the answer:</p>
              {answerText && <p className="mt-1 text-ink">{answerText}</p>}
            </div>
          </div>
        )}
        <Button className="mt-3 w-full" variant={correct ? 'primary' : 'gold'} onClick={onContinue}>
          {isLast ? 'See results' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
