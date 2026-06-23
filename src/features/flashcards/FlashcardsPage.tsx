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

const GRADES: { grade: Grade; label: string; className: string }[] = [
  { grade: 'again', label: 'Again', className: 'bg-coral-400 text-white hover:bg-coral-500' },
  { grade: 'hard', label: 'Hard', className: 'bg-gold-300 text-ink hover:bg-gold-400' },
  { grade: 'good', label: 'Good', className: 'bg-teal-500 text-white hover:bg-teal-600' },
  { grade: 'easy', label: 'Easy', className: 'bg-teal-700 text-white hover:bg-teal-800' },
];

export function FlashcardsPage() {
  const srs = useStore((s) => s.srs);
  const reviewPhrase = useStore((s) => s.reviewPhrase);

  // Snapshot the session once on mount so grading doesn't reshuffle mid-session.
  const session = useMemo<Phrase[]>(() => buildSession(srs, { newLimit: 8, sessionLimit: 20 }), []);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  if (session.length === 0) {
    return (
      <EmptyState
        title="Nothing to review right now 🌴"
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
          title="Session complete! 🎉"
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
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <Link to="/" className="text-sm text-ink/40">
          ✕
        </Link>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-teal-100">
          <div
            className="h-full rounded-full bg-teal-600 transition-all"
            style={{ width: `${(index / session.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-ink/50">
          {index + 1}/{session.length}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="w-full text-left"
        aria-label="Flip card"
      >
        <Card className="min-h-[18rem] animate-[pop_0.25s_ease-out] flex-col items-center justify-center gap-4 text-center">
          {isNew && (
            <span className="mx-auto mb-1 inline-block rounded-full bg-gold-300/40 px-3 py-1 text-xs font-bold text-gold-600">
              ✨ New phrase
            </span>
          )}
          <div className="flex justify-center">
            <AudioButton clipId={phraseAudioId(phrase)} fallbackText={phrase.script ?? phrase.roman} size="lg" />
          </div>
          <div className="text-3xl font-bold text-teal-900">{phrase.roman}</div>
          <div className="text-xl text-teal-700/80" lang="hi">
            {phrase.deva}
          </div>

          {flipped ? (
            <div className="mt-2 space-y-1 border-t border-teal-100 pt-4">
              <div className="text-xl font-semibold text-ink">{phrase.english}</div>
              <div className="text-ink/60" lang="hi">
                {phrase.hindi}
              </div>
              {phrase.notes && (
                <div className="mt-3 rounded-xl bg-gold-300/20 px-3 py-2 text-sm text-ink/70">
                  💡 {phrase.notes}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink/40">Tap to reveal meaning</p>
          )}
        </Card>
      </button>

      {flipped ? (
        <div className="grid grid-cols-4 gap-2">
          {GRADES.map(({ grade, label, className }) => (
            <button
              key={grade}
              onClick={() => onGrade(grade)}
              className={`flex flex-col items-center rounded-2xl py-3 font-semibold transition active:scale-95 ${className}`}
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
      <h1 className="text-2xl font-bold text-teal-900">{title}</h1>
      <p className="max-w-xs text-ink/60">{body}</p>
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
