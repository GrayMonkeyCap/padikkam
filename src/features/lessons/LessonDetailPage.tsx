import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getLesson, phrasesForLesson, dialoguesForLesson, getUnit, getTip, phraseAudioId, orderedLessons } from '../../content';
import { prefetchAudio } from '../../audio/useAudio';
import { useStore } from '../../storage/store';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { PhraseDisplay } from '../../components/PhraseDisplay';
import { LessonTip } from '../../components/LessonTip';
import { PronouncePractice } from '../../components/PronouncePractice';
import { Ammu } from '../../components/Ammu';
import { Celebration } from '../../components/Celebration';

function CrownIcons({ level }: { level: number }) {
  if (level <= 0) return null;
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-secondary-soft px-3 py-1">
      {Array.from({ length: Math.min(level, 5) }, (_, i) => (
        <svg key={i} width={14} height={14} viewBox="0 0 24 24" fill="var(--color-secondary)">
          <path d="M2 8l4 12h12l4-12-5 4-5-8-5 8-5-4z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-bold text-secondary-deep">{level}/5</span>
    </div>
  );
}

function getNextLesson(currentId: string) {
  const idx = orderedLessons.findIndex((l) => l.id === currentId);
  return idx >= 0 && idx < orderedLessons.length - 1 ? orderedLessons[idx + 1] : null;
}

export function LessonDetailPage() {
  const { lessonId = '' } = useParams();
  const navigate = useNavigate();
  const lesson = getLesson(lessonId);
  const completeLesson = useStore((s) => s.completeLesson);
  const completed = useStore((s) => s.progress.completedLessons.includes(lessonId));
  const level = useStore((s) => s.progress.lessonLevels[lessonId] ?? 0);
  const [showCompletePopup, setShowCompletePopup] = useState(false);

  useEffect(() => {
    if (!lesson) return;
    const clipIds = phrasesForLesson(lesson.id).map((p) => phraseAudioId(p));
    prefetchAudio(clipIds);
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-ink-muted">Lesson not found.</p>
        <Link to="/learn">
          <Button variant="secondary">Back to lessons</Button>
        </Link>
      </div>
    );
  }

  const phrases = phrasesForLesson(lesson.id);
  const dialogues = dialoguesForLesson(lesson.id);
  const unit = getUnit(lesson.unit);
  const tip = getTip(lesson.id);

  return (
    <div className="space-y-5">
      <Link to="/learn" className="inline-flex items-center gap-1 text-sm font-medium text-primary-deep hover:text-primary">
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        {unit?.title}
      </Link>

      <header>
        <h1 className="font-display text-2xl font-bold text-ink">
          {lesson.emoji} {lesson.title}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">{lesson.goal}</p>
        {level > 0 && <div className="mt-2"><CrownIcons level={level} /></div>}
      </header>

      {tip && <LessonTip tip={tip} />}

      <section className="space-y-3">
        <h2 className="text-sm font-display font-bold uppercase tracking-wide text-ink-faint">Phrases</h2>
        {phrases.map((p) => (
          <Card key={p.id} className="space-y-3">
            <PhraseDisplay phrase={p} />
            <PronouncePractice clipId={phraseAudioId(p)} fallbackText={p.script ?? p.roman} roman={p.roman} />
          </Card>
        ))}
      </section>

      {dialogues.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-display font-bold uppercase tracking-wide text-ink-faint">Conversation</h2>
          {dialogues.map((d) => (
            <Link key={d.id} to={`/dialogue/${d.id}`} className="block">
              <Card className="flex items-center gap-3 hover:border-primary/30">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-soft text-xl">
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="var(--color-secondary)"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
                </div>
                <div className="flex-1">
                  <div className="font-display font-semibold text-ink">{d.scenario}</div>
                  <div className="text-xs text-ink-muted">{d.setup}</div>
                </div>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </Card>
            </Link>
          ))}
        </section>
      )}

      <div className="space-y-2.5 pt-2">
        <Link to={`/quiz/${lesson.id}`} className="block">
          <Button size="lg" className="w-full">
            Practice quiz
          </Button>
        </Link>
        <Button
          variant={completed ? 'secondary' : 'gold'}
          size="lg"
          className="w-full"
          onClick={() => {
            if (!completed) {
              completeLesson(lesson.id);
              setShowCompletePopup(true);
            }
          }}
          disabled={completed}
        >
          {completed ? 'Lesson complete' : 'Mark as complete (+20 XP)'}
        </Button>
      </div>

      {showCompletePopup && <CompletionPopup lessonId={lessonId} onClose={() => setShowCompletePopup(false)} />}
    </div>
  );
}

function CompletionPopup({ lessonId, onClose }: { lessonId: string; onClose: () => void }) {
  const navigate = useNavigate();
  const nextLesson = getNextLesson(lessonId);
  const nextUnit = nextLesson ? getUnit(nextLesson.unit) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <Celebration show />
      <div
        className="mx-4 w-full max-w-sm animate-pop rounded-[22px] border-2 border-border bg-surface-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <Ammu state="celebrating" size={80} />
          <h2 className="font-display text-xl font-bold text-ink">Lesson complete!</h2>
          <p className="text-sm text-ink-muted">+20 XP earned. Keep the momentum going!</p>

          <div className="mt-2 flex w-full flex-col gap-2">
            {nextLesson && (
              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate(`/learn/${nextLesson.id}`)}
              >
                Next: {nextLesson.emoji} {nextLesson.title}
              </Button>
            )}
            <Link to={`/quiz/${lessonId}`} className="block">
              <Button variant="secondary" size="lg" className="w-full">
                Practice quiz
              </Button>
            </Link>
            <button
              onClick={onClose}
              className="text-sm font-medium text-ink-muted hover:text-ink"
            >
              Stay on this lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
