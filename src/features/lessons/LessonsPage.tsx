import { Link } from 'react-router-dom';
import { units, lessonsForUnit, orderedLessons } from '../../content';
import { useStore } from '../../storage/store';
import { Card } from '../../components/Card';

/** A lesson unlocks once the previous lesson in the path is complete. */
function useUnlock() {
  const completed = useStore((s) => s.progress.completedLessons);
  return (lessonId: string): boolean => {
    const idx = orderedLessons.findIndex((l) => l.id === lessonId);
    if (idx <= 0) return true;
    return completed.includes(orderedLessons[idx - 1].id);
  };
}

export function LessonsPage() {
  const completed = useStore((s) => s.progress.completedLessons);
  const levels = useStore((s) => s.progress.lessonLevels);
  const isUnlocked = useUnlock();

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-2xl font-bold text-teal-900">Learn</h1>
        <p className="text-sm text-ink/60">Follow the path — each lesson unlocks the next.</p>
      </header>

      {units.map((unit) => (
        <section key={unit.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{unit.emoji}</span>
            <div>
              <h2 className="font-bold text-teal-900">{unit.title}</h2>
              <p className="text-xs text-ink/50">{unit.description}</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {lessonsForUnit(unit.id).map((lesson) => {
              const done = completed.includes(lesson.id);
              const unlocked = isUnlocked(lesson.id);
              const level = levels[lesson.id] ?? 0;

              const inner = (
                <Card
                  className={`flex items-center gap-3 ${
                    unlocked ? 'hover:border-teal-300' : 'opacity-55'
                  } ${done ? 'border-teal-300 bg-teal-50/40' : ''}`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-xl">
                    {unlocked ? lesson.emoji : '🔒'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 font-semibold text-teal-900">
                      {lesson.title}
                      {done && <span className="text-teal-600">✓</span>}
                    </div>
                    <div className="truncate text-xs text-ink/55">{lesson.goal}</div>
                  </div>
                  {level > 0 && (
                    <span className="shrink-0 text-sm" title={`Crown level ${level}`}>
                      {'👑'.repeat(Math.min(level, 3))}
                      {level > 3 && <span className="text-xs font-bold text-gold-600"> {level}</span>}
                    </span>
                  )}
                </Card>
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
    </div>
  );
}
