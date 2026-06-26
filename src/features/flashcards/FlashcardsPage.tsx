import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../storage/store';
import { buildSession } from '../../srs/queue';
import { newCard, previewInterval, type Grade } from '../../srs/sm2';
import { phraseAudioId } from '../../content';
import type { Phrase } from '../../content/types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { AudioButton } from '../../components/AudioButton';
import { Celebration } from '../../components/Celebration';
import { Ammu } from '../../components/Ammu';

const GRADES: { grade: Grade; label: string; className: string }[] = [
  { grade: 'again', label: 'Again', className: 'bg-accent text-white shadow-[0_4px_0_var(--color-accent-deep)] active:translate-y-[2px] active:shadow-none' },
  { grade: 'hard', label: 'Hard', className: 'bg-secondary text-ink shadow-[0_4px_0_var(--color-secondary-deep)] active:translate-y-[2px] active:shadow-none' },
  { grade: 'good', label: 'Good', className: 'bg-primary text-white shadow-[0_4px_0_var(--color-primary-deep)] active:translate-y-[2px] active:shadow-none' },
  { grade: 'easy', label: 'Easy', className: 'bg-success text-white shadow-[0_4px_0_var(--color-success-deep)] active:translate-y-[2px] active:shadow-none' },
];

export function FlashcardsPage() {
  const srs = useStore((s) => s.srs);
  const reviewPhrase = useStore((s) => s.reviewPhrase);

  const session = useMemo<Phrase[]>(() => buildSession(srs, { newLimit: 8, sessionLimit: 20 }), []);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  if (session.length === 0) {
    return (
      <EmptyState
        title="Nothing to review right now"
        body="You're all caught up. Learn a new lesson to add more phrases to your deck."
      />
    );
  }

  const done = index >= session.length;
  if (done) {
    return (
      <>
        <Celebration show />
        <EmptyState
          title="Session complete!"
          body={`You revised ${reviewed} phrase${reviewed === 1 ? '' : 's'}. Small reps, big fluency.`}
          cta
        />
      </>
    );
  }

  const phrase = session[index];
  const card = srs[phrase.id] ?? newCard();
  const isNew = !srs[phrase.id];

  const onGrade = (grade: Grade) => {
    reviewPhrase(phrase.id, grade);
    setReviewed((n) => n + 1);
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-ink-faint">
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </Link>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-primary-soft">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(index / session.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-display font-medium text-ink-muted">
          {index + 1}/{session.length}
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setFlipped((f) => !f)}
        className="w-full cursor-pointer text-left"
        aria-label="Flip card"
      >
        <Card className="min-h-[18rem] animate-pop flex-col items-center justify-center gap-4 text-center bg-gradient-to-br from-surface-card to-primary-soft/30">
          {isNew && (
            <span className="mx-auto mb-1 inline-block rounded-full bg-secondary-soft px-3 py-1 text-xs font-display font-bold text-secondary-deep">
              New phrase
            </span>
          )}
          <div className="flex justify-center">
            <AudioButton clipId={phraseAudioId(phrase)} fallbackText={phrase.script ?? phrase.roman} size="lg" />
          </div>
          <div className="font-display text-3xl font-bold text-ink">{phrase.roman}</div>
          <div className="text-xl text-ink-muted" lang="hi">
            {phrase.deva}
          </div>

          {flipped ? (
            <div className="mt-2 space-y-1 border-t border-border pt-4">
              <div className="text-xl font-semibold text-ink">{phrase.english}</div>
              <div className="text-ink/60" lang="hi">
                {phrase.hindi}
              </div>
              {phrase.notes && (
                <div className="mt-3 rounded-2xl bg-secondary-soft px-3 py-2 text-sm text-ink-muted">
                  {phrase.notes}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink-faint">Tap to reveal meaning</p>
          )}
        </Card>
      </div>

      {flipped ? (
        <div className="grid grid-cols-4 gap-2">
          {GRADES.map(({ grade, label, className }) => (
            <button
              key={grade}
              onClick={() => onGrade(grade)}
              className={`flex flex-col items-center rounded-full py-3 font-display font-semibold transition ${className}`}
            >
              <span className="text-sm">{label}</span>
              <span className="text-[10px] opacity-80">{previewInterval(card, grade)}</span>
            </button>
          ))}
        </div>
      ) : (
        <Button size="lg" className="w-full" onClick={() => setFlipped(true)}>
          Show answer
        </Button>
      )}
    </div>
  );
}

function EmptyState({ title, body, cta }: { title: string; body: string; cta?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 pt-16 text-center">
      <Ammu state={cta ? 'celebrating' : 'sleepy'} size={96} />
      <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
      <p className="max-w-xs text-ink-muted">{body}</p>
      <div className="flex gap-2">
        <Link to="/learn">
          <Button variant="gold">Go to lessons</Button>
        </Link>
        {cta && (
          <Link to="/">
            <Button variant="secondary">Home</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
