import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getLesson,
  phrasesForLesson,
  phrases as allPhrases,
  getPhrase,
} from '../../content';
import { generateQuiz, type QuizItem } from './generate';
import { McqExercise } from './exercises/McqExercise';
import { BuildExercise } from './exercises/BuildExercise';
import { MatchExercise } from './exercises/MatchExercise';
import { useStore } from '../../storage/store';
import { XP } from '../../lib/xp';
import { Button } from '../../components/Button';
import { Celebration } from '../../components/Celebration';
import { Ammu } from '../../components/Ammu';

type Mode = 'lesson' | 'all' | 'mistakes';

export function QuizPage({ mode = 'lesson' }: { mode?: Mode }) {
  const { lessonId } = useParams();
  const lesson = lessonId ? getLesson(lessonId) : undefined;

  const addXp = useStore((s) => s.addXp);
  const recordMastery = useStore((s) => s.recordMastery);
  const levelUpLesson = useStore((s) => s.levelUpLesson);
  const addMistake = useStore((s) => s.addMistake);
  const clearMistake = useStore((s) => s.clearMistake);
  const mistakeIds = useStore((s) => s.progress.mistakes);

  const [attempt, setAttempt] = useState(0);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [finished, setFinished] = useState(false);

  const retry = () => {
    setAttempt((a) => a + 1);
    setIndex(0);
    setCorrectCount(0);
    setCombo(0);
    setFinished(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- attempt forces a fresh quiz on retry
  const items = useMemo<QuizItem[]>(() => {
    const pool =
      mode === 'mistakes'
        ? mistakeIds.map((id) => getPhrase(id)).filter((p): p is NonNullable<typeof p> => Boolean(p))
        : mode === 'all'
          ? allPhrases
          : lesson
            ? phrasesForLesson(lesson.id)
            : allPhrases;
    return generateQuiz(pool, mode === 'mistakes' ? 12 : 9);
  }, [lesson, mode, attempt]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 pt-16 text-center">
        <Ammu state={mode === 'mistakes' ? 'celebrating' : 'thinking'} size={96} />
        <h1 className="font-display text-2xl font-bold text-ink">
          {mode === 'mistakes' ? 'No mistakes to practice!' : 'Nothing to quiz yet'}
        </h1>
        <p className="max-w-xs text-ink-muted">
          {mode === 'mistakes'
            ? "Your mistakes deck is empty — that means you're doing great. Keep learning!"
            : 'Learn a lesson first, then come back to test yourself.'}
        </p>
        <Link to="/learn">
          <Button variant="gold">Go to lessons</Button>
        </Link>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((correctCount / items.length) * 100);
    if (lesson) {
      recordMastery(lesson.id, pct);
      if (pct >= 60) levelUpLesson(lesson.id);
    }
    return (
      <Results
        pct={pct}
        correct={correctCount}
        total={items.length}
        lessonId={lesson?.id}
        onRetry={retry}
      />
    );
  }

  const item = items[index];
  const isLast = index + 1 >= items.length;

  const handleComplete = (correct: boolean) => {
    if (correct) {
      setCorrectCount((c) => c + 1);
      setCombo((c) => c + 1);
      addXp(XP.quizCorrect);
    } else {
      setCombo(0);
    }

    if (item.type === 'mcq' || item.type === 'build') {
      if (correct) clearMistake(item.phraseId);
      else addMistake(item.phraseId);
    }

    if (isLast) setFinished(true);
    else setIndex((i) => i + 1);
  };

  const progressPct = (index / items.length) * 100;

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Link to={mode === 'lesson' && lesson ? `/learn/${lesson.id}` : '/'} className="text-sm text-ink-faint">
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </Link>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-success-soft">
          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="text-sm font-display font-medium text-ink-muted">
          {index + 1}/{items.length}
        </span>
      </div>

      {item.type === 'mcq' && (
        <McqExercise key={index} item={item} combo={combo} isLast={isLast} onComplete={handleComplete} />
      )}
      {item.type === 'build' && (
        <BuildExercise key={index} item={item} combo={combo} isLast={isLast} onComplete={handleComplete} />
      )}
      {item.type === 'match' && (
        <MatchExercise key={index} item={item} combo={combo} isLast={isLast} onComplete={handleComplete} />
      )}
    </div>
  );
}

function Results({
  pct,
  correct,
  total,
  lessonId,
  onRetry,
}: {
  pct: number;
  correct: number;
  total: number;
  lessonId?: string;
  onRetry: () => void;
}) {
  const level = useStore((s) => (lessonId ? s.progress.lessonLevels[lessonId] ?? 0 : 0));
  const ammuState = pct === 100 ? 'celebrating' : pct >= 70 ? 'greeting' : 'encouraging';
  const message =
    pct === 100 ? 'Flawless!' : pct >= 70 ? 'Great work!' : 'Good effort — keep going!';
  return (
    <>
      <Celebration show={pct >= 70} />
      <div className="flex flex-col items-center gap-4 pt-12 text-center">
        <Ammu state={ammuState} size={120} />
        <h1 className="font-display text-2xl font-bold text-ink">{message}</h1>
        <p className="text-ink-muted">
          You got <strong>{correct}</strong> of <strong>{total}</strong> right ({pct}%).
        </p>
        {lessonId && level > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-secondary-soft px-4 py-2 text-sm font-display font-bold text-secondary-deep">
            {Array.from({ length: Math.min(level, 5) }, (_, i) => (
              <svg key={i} width={16} height={16} viewBox="0 0 24 24" fill="var(--color-secondary)"><path d="M2 8l4 12h12l4-12-5 4-5-8-5 8-5-4z"/></svg>
            ))}
            Crown level {level}
          </div>
        )}
        <div className="mt-2 flex gap-2">
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
          <Link to={lessonId ? `/learn/${lessonId}` : '/'}>
            <Button variant="gold">{lessonId ? 'Back to lesson' : 'Home'}</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
