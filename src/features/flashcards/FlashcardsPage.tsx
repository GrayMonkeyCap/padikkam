import { useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../storage/store';
import { buildSession } from '../../srs/queue';
import { newCard, previewInterval, type Grade } from '../../srs/sm2';
import { phraseAudioId } from '../../content';
import type { Phrase } from '../../content/types';
import { Button } from '../../components/Button';
import { AudioButton } from '../../components/AudioButton';
import { Celebration } from '../../components/Celebration';
import { Ammu } from '../../components/Ammu';
import { playSwipeRight, playSwipeLeft, playCelebration } from '../../audio/sounds';

/* ── Swipe constants ── */
const SWIPE_THRESHOLD = 0.35; // 35% of container width to commit
const MAX_ROTATION = 12; // degrees
const SWIPE_EXIT_DURATION = 400; // ms — matches CSS animation

/* ── Difficulty buttons shown after a left-swipe ── */
const DIFFICULTY_OPTIONS: { grade: Grade; label: string; sublabel: string; className: string }[] = [
  {
    grade: 'again',
    label: 'Forgot completely',
    sublabel: '',
    className: 'bg-accent text-white shadow-[0_4px_0_var(--color-accent-deep)] active:translate-y-[2px] active:shadow-none',
  },
  {
    grade: 'hard',
    label: 'It was hard',
    sublabel: '',
    className: 'bg-secondary text-ink shadow-[0_4px_0_var(--color-secondary-deep)] active:translate-y-[2px] active:shadow-none',
  },
  {
    grade: 'easy',
    label: 'Almost had it',
    sublabel: '',
    className: 'bg-primary text-white shadow-[0_4px_0_var(--color-primary-deep)] active:translate-y-[2px] active:shadow-none',
  },
];

/* ════════════════════════════════════════════════════════════
   SwipeCard — the draggable, swipeable phrase card
   ════════════════════════════════════════════════════════════ */

interface SwipeCardProps {
  phrase: Phrase;
  isNew: boolean;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  /** True when this is the top (active) card */
  active: boolean;
}

function SwipeCard({ phrase, isNew, onSwipeRight, onSwipeLeft, active }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null);
  const [snapping, setSnapping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragIntent = useRef<boolean | null>(null); // null = undecided, true = horizontal drag, false = vertical scroll

  const containerWidth = useCallback(() => {
    return containerRef.current?.offsetWidth ?? 320;
  }, []);

  const progress = dragX / containerWidth(); // -1 to 1 range
  const rotation = Math.min(Math.max(progress * MAX_ROTATION, -MAX_ROTATION), MAX_ROTATION);
  const rightOpacity = Math.min(Math.max(progress * 2, 0), 1);
  const leftOpacity = Math.min(Math.max(-progress * 2, 0), 1);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!active || exiting) return;
      // Don't capture if the target is a button or interactive element
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a')) return;

      setIsDragging(true);
      isDragIntent.current = null;
      startX.current = e.clientX;
      startY.current = e.clientY;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [active, exiting],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || exiting) return;
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;

      // Decide drag intent on first significant movement
      if (isDragIntent.current === null) {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        if (absDx < 8 && absDy < 8) return; // too small to decide
        isDragIntent.current = absDx > absDy;
        if (!isDragIntent.current) {
          // Vertical scroll — abort drag
          setIsDragging(false);
          setDragX(0);
          return;
        }
      }

      if (isDragIntent.current) {
        setDragX(dx);
      }
    },
    [isDragging, exiting],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging || exiting) return;
    setIsDragging(false);

    const ratio = dragX / containerWidth();

    if (ratio > SWIPE_THRESHOLD) {
      // Commit right swipe
      setExiting('right');
      setTimeout(() => onSwipeRight(), SWIPE_EXIT_DURATION);
    } else if (ratio < -SWIPE_THRESHOLD) {
      // Commit left swipe
      setExiting('left');
      setTimeout(() => onSwipeLeft(), SWIPE_EXIT_DURATION);
    } else {
      // Snap back
      setDragX(0);
      setSnapping(true);
      setTimeout(() => setSnapping(false), 300);
    }
  }, [isDragging, exiting, dragX, containerWidth, onSwipeRight, onSwipeLeft]);

  // Build inline styles for the drag transform
  const cardStyle: React.CSSProperties = exiting
    ? {
        animation: `${exiting === 'right' ? 'swipeRight' : 'swipeLeft'} ${SWIPE_EXIT_DURATION}ms ease-in forwards`,
        // Preserve the current drag position as starting point
        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
      }
    : {
        transform: isDragging
          ? `translateX(${dragX}px) rotate(${rotation}deg)`
          : 'translateX(0) rotate(0)',
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        animation: snapping ? 'snapBack 0.3s ease-out' : undefined,
      };

  if (!active) {
    // Background card: slightly scaled down, no interaction
    return (
      <div
        className="absolute inset-0 rounded-[22px] border border-border bg-gradient-to-br from-surface-card to-primary-soft/30 shadow-sm"
        style={{ transform: 'scale(0.95) translateY(8px)', opacity: 0.6 }}
      />
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ touchAction: 'pan-y' }}>
      <div
        ref={cardRef}
        className="relative h-full w-full cursor-grab rounded-[22px] border border-border bg-gradient-to-br from-surface-card to-primary-soft/30 p-5 shadow-md select-none active:cursor-grabbing"
        style={cardStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* ── Swipe direction overlays ── */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[22px] bg-success/20"
          style={{ opacity: rightOpacity, transition: isDragging ? 'none' : 'opacity 0.2s' }}
        >
          <div className="rounded-full bg-success p-3 shadow-lg">
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[22px] bg-accent/20"
          style={{ opacity: leftOpacity, transition: isDragging ? 'none' : 'opacity 0.2s' }}
        >
          <div className="rounded-full bg-accent p-3 shadow-lg">
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        </div>

        {/* ── Card content ── */}
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          {isNew && (
            <span className="inline-block rounded-full bg-secondary-soft px-3 py-1 text-xs font-display font-bold text-secondary-deep">
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
          <p className="mt-4 text-sm text-ink-faint">
            Swipe <span className="font-semibold text-success">right →</span> if you knew it
            <br />
            Swipe <span className="font-semibold text-accent">← left</span> if you didn't
          </p>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   AnswerPanel — shown after a left swipe, with difficulty buttons
   ════════════════════════════════════════════════════════════ */

interface AnswerPanelProps {
  phrase: Phrase;
  card: ReturnType<typeof newCard>;
  onGrade: (grade: Grade) => void;
}

function AnswerPanel({ phrase, card, onGrade }: AnswerPanelProps) {
  return (
    <div className="space-y-5" style={{ animation: 'answerSlideUp 0.35s ease-out' }}>
      {/* Answer card */}
      <div className="rounded-[22px] border border-border bg-gradient-to-br from-surface-card to-accent-soft/30 p-6 shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex justify-center">
            <AudioButton clipId={phraseAudioId(phrase)} fallbackText={phrase.script ?? phrase.roman} size="lg" />
          </div>
          <div className="font-display text-2xl font-bold text-ink">{phrase.roman}</div>
          <div className="text-lg text-ink-muted" lang="hi">
            {phrase.deva}
          </div>
          <div className="mt-2 border-t border-border pt-4">
            <div className="text-xl font-semibold text-ink">{phrase.english}</div>
            <div className="mt-1 text-ink/60" lang="hi">
              {phrase.hindi}
            </div>
            {phrase.notes && (
              <div className="mt-3 rounded-2xl bg-secondary-soft px-3 py-2 text-sm text-ink-muted">
                {phrase.notes}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Difficulty label */}
      <p className="text-center text-sm font-display font-medium text-ink-muted">How difficult was it?</p>

      {/* Difficulty buttons */}
      <div className="grid grid-cols-1 gap-3">
        {DIFFICULTY_OPTIONS.map(({ grade, label, className }) => (
          <button
            key={grade}
            onClick={() => onGrade(grade)}
            className={`flex items-center justify-between rounded-2xl px-5 py-4 font-display font-semibold transition ${className}`}
          >
            <span>{label}</span>
            <span className="text-sm opacity-80">{previewInterval(card, grade)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   FlashcardsPage — main orchestrator
   ════════════════════════════════════════════════════════════ */

export function FlashcardsPage() {
  const srs = useStore((s) => s.srs);
  const reviewPhrase = useStore((s) => s.reviewPhrase);
  const completedLessons = useStore((s) => s.progress.completedLessons);

  const session = useMemo<Phrase[]>(
    () => buildSession(srs, { sessionLimit: 20, completedLessons }),
    [completedLessons],
  );

  const [index, setIndex] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null);
  const [cardKey, setCardKey] = useState(0);

  const restart = () => {
    setIndex(0);
    setReviewed(0);
    setShowAnswer(false);
    setCurrentPhrase(null);
    setCardKey((k) => k + 1);
  };

  if (session.length === 0) {
    return (
      <EmptyState
        title="No phrases to review"
        body="Finish a lesson first — its phrases will appear here for review."
      />
    );
  }

  const done = index >= session.length;
  if (done && !showAnswer) {
    return (
      <>
        <Celebration show />
        <EmptyState
          title="Session complete!"
          body={`You revised ${reviewed} phrase${reviewed === 1 ? '' : 's'} this round.`}
          cta
          onReviewAgain={restart}
        />
      </>
    );
  }

  const phrase = showAnswer && currentPhrase ? currentPhrase : session[index];
  const card = srs[phrase?.id] ?? newCard();
  const isNew = phrase ? !srs[phrase.id] : false;

  const advance = () => {
    setReviewed((n) => n + 1);
    setShowAnswer(false);
    setCurrentPhrase(null);
    const next = index + 1;
    setIndex(next);
    setCardKey((k) => k + 1);
    if (next >= session.length) playCelebration();
  };

  const handleSwipeRight = () => {
    if (!phrase) return;
    playSwipeRight();
    reviewPhrase(phrase.id, 'good');
    advance();
  };

  const handleSwipeLeft = () => {
    if (!phrase) return;
    playSwipeLeft();
    setCurrentPhrase(phrase);
    setShowAnswer(true);
  };

  const handleDifficultyGrade = (grade: Grade) => {
    if (!phrase) return;
    reviewPhrase(phrase.id, grade);
    advance();
  };

  // Display index — when showing answer, the index hasn't advanced yet
  const displayIndex = showAnswer ? index : index;
  const progressPct = (displayIndex / session.length) * 100;

  return (
    <div className="flex flex-col gap-5">
      {/* ── Progress bar ── */}
      <div className="flex items-center gap-3">
        <Link to="/" className="text-ink-faint">
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </Link>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-primary-soft">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-sm font-display font-medium text-ink-muted">
          {Math.min(displayIndex + 1, session.length)}/{session.length}
        </span>
      </div>

      {/* ── Main content ── */}
      {showAnswer && currentPhrase ? (
        <AnswerPanel phrase={currentPhrase} card={card} onGrade={handleDifficultyGrade} />
      ) : !done && phrase ? (
        <div className="relative" style={{ height: '24rem' }}>
          {/* Next card (background) — show if there is one */}
          {index + 1 < session.length && (
            <SwipeCard
              key={`bg-${cardKey}`}
              phrase={session[index + 1]}
              isNew={!srs[session[index + 1].id]}
              onSwipeRight={() => {}}
              onSwipeLeft={() => {}}
              active={false}
            />
          )}
          {/* Active card */}
          <SwipeCard
            key={`active-${cardKey}`}
            phrase={phrase}
            isNew={isNew}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            active
          />
        </div>
      ) : null}

      {/* ── Manual buttons as fallback (below the card) ── */}
      {!showAnswer && !done && phrase && (
        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={handleSwipeLeft}
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent bg-accent-soft text-accent shadow-sm transition hover:scale-110 active:scale-95"
            aria-label="Don't know"
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <button
            onClick={handleSwipeRight}
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-success bg-success-soft text-success shadow-sm transition hover:scale-110 active:scale-95"
            aria-label="Knew it"
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   EmptyState — reused for "nothing to review" and "session complete"
   ════════════════════════════════════════════════════════════ */

function EmptyState({ title, body, cta, onReviewAgain }: { title: string; body: string; cta?: boolean; onReviewAgain?: () => void }) {
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
      {onReviewAgain && (
        <button
          onClick={onReviewAgain}
          className="mt-2 text-sm font-medium text-primary-deep hover:text-primary"
        >
          Review again
        </button>
      )}
    </div>
  );
}
