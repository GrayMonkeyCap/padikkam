import { Link } from 'react-router-dom';
import { units, lessonsForUnit, orderedLessons } from '../../content';
import { useStore } from '../../storage/store';
import { Card } from '../../components/Card';
import { Ammu } from '../../components/Ammu';
import { TopicIcon } from '../../components/TopicIcon';

function useUnlock() {
  const completed = useStore((s) => s.progress.completedLessons);
  return (lessonId: string): boolean => {
    const idx = orderedLessons.findIndex((l) => l.id === lessonId);
    if (idx <= 0) return true;
    return completed.includes(orderedLessons[idx - 1].id);
  };
}

function CrownIcons({ level }: { level: number }) {
  if (level <= 0) return null;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: Math.min(level, 5) }, (_, i) => (
        <svg key={i} width={14} height={14} viewBox="0 0 24 24" fill="var(--color-secondary)">
          <path d="M2 8l4 12h12l4-12-5 4-5-8-5 8-5-4z" />
        </svg>
      ))}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="var(--color-ink-faint)">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" fill="none" stroke="var(--color-ink-faint)" strokeWidth={2} />
    </svg>
  );
}

export function LessonsPage() {
  const completed = useStore((s) => s.progress.completedLessons);
  const levels = useStore((s) => s.progress.lessonLevels);
  const isUnlocked = useUnlock();

  const currentLessonId = orderedLessons.find((l) => !completed.includes(l.id))?.id;

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Learn</h1>
        <p className="text-sm text-ink-muted">Follow the path — each lesson unlocks the next.</p>
      </header>

      {units.map((unit) => (
        <section key={unit.id} className="space-y-3">
          <div className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary-soft to-transparent px-3 py-2">
            <TopicIcon emoji={unit.emoji} size={28} />
            <div>
              <h2 className="font-display font-bold text-ink">{unit.title}</h2>
              <p className="text-xs text-ink-muted">{unit.description}</p>
            </div>
          </div>

          <div className="relative space-y-2.5 pl-6">
            {/* Zigzag path line */}
            <div className="absolute left-[13px] top-0 bottom-0 w-0.5 bg-border" />

            {lessonsForUnit(unit.id).map((lesson) => {
              const done = completed.includes(lesson.id);
              const unlocked = isUnlocked(lesson.id);
              const isCurrent = lesson.id === currentLessonId;
              const level = levels[lesson.id] ?? 0;

              const nodeColor = done
                ? 'bg-success'
                : isCurrent
                  ? 'bg-primary ring-4 ring-primary-soft'
                  : 'bg-surface-sunk border-2 border-border';

              const inner = (
                <div className="flex items-center gap-3">
                  {/* Node dot */}
                  <div className={`relative z-10 -ml-6 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${nodeColor}`}>
                    {done ? <CheckIcon /> : !unlocked ? <LockIcon /> : null}
                  </div>

                  <Card
                    className={`flex flex-1 items-center gap-3 ${
                      unlocked ? 'hover:border-primary/30' : 'opacity-50'
                    } ${done ? 'border-success/20 bg-success-soft' : ''}`}
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${done ? 'bg-success-soft' : isCurrent ? 'bg-primary-soft' : 'bg-surface-sunk'}`}>
                      {unlocked ? <TopicIcon emoji={lesson.emoji} size={22} color={done ? 'var(--color-success)' : isCurrent ? 'var(--color-primary)' : 'var(--color-ink-faint)'} /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-display font-semibold text-ink">
                        <span className="truncate">{lesson.title}</span>
                        <CrownIcons level={level} />
                      </div>
                      <div className="truncate text-xs text-ink-muted">{lesson.goal}</div>
                    </div>
                  </Card>
                </div>
              );

              return unlocked ? (
                <Link key={lesson.id} to={`/learn/${lesson.id}`} className="block">
                  {inner}
                </Link>
              ) : (
                <div key={lesson.id}>{inner}</div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="flex justify-center pb-4">
        <Ammu state="encouraging" size={72} />
      </div>
    </div>
  );
}
