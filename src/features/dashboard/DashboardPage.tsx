import { Link } from 'react-router-dom';
import { useStore } from '../../storage/store';
import { dueCount, newPhrases } from '../../srs/queue';
import { orderedLessons, getUnit } from '../../content';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ProgressRing } from '../../components/ProgressRing';
import { Ammu } from '../../components/Ammu';
import { levelFromXp } from '../../lib/xp';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardPage() {
  const progress = useStore((s) => s.progress);
  const srs = useStore((s) => s.srs);

  const due = dueCount(srs);
  const newCount = newPhrases(srs).length;
  const mistakeCount = progress.mistakes.length;
  const goalFraction = progress.dailyGoal > 0 ? progress.todayXp / progress.dailyGoal : 0;
  const goalMet = progress.todayXp >= progress.dailyGoal;
  const { level } = levelFromXp(progress.xp);

  const nextLesson =
    orderedLessons.find((l) => !progress.completedLessons.includes(l.id)) ?? orderedLessons[0];
  const nextUnit = nextLesson ? getUnit(nextLesson.unit) : undefined;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Ammu state={goalMet ? 'celebrating' : 'greeting'} size={56} />
          <div>
            <p className="text-sm text-ink-muted">{greeting()}</p>
            <h1 className="font-display text-2xl font-bold text-ink">Padikkam</h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-secondary-soft px-3 py-1.5 text-sm font-display font-bold text-secondary-deep">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="var(--color-secondary)"><path d="M12 2c-1 4-4 6-6 10a7 7 0 1014 0C18 8 15 6 12 2z"/></svg>
          {progress.streak}
          <span className="font-medium text-ink-faint">day{progress.streak === 1 ? '' : 's'}</span>
        </div>
      </header>

      {/* Daily goal */}
      <Card className="flex items-center gap-5">
        <ProgressRing
          value={goalFraction}
          label={`${progress.todayXp}`}
          sublabel={`/ ${progress.dailyGoal} XP`}
        />
        <div className="flex-1">
          <h2 className="font-display text-lg font-bold text-ink">
            {goalMet ? 'Goal smashed!' : "Today's goal"}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {goalMet
              ? 'Every bit extra makes it stick. Keep going!'
              : `You're ${Math.max(0, progress.dailyGoal - progress.todayXp)} XP away. You've got this.`}
          </p>
          <p className="mt-2 text-xs font-medium text-grape">Level {level} · {progress.xp} XP total</p>
        </div>
      </Card>

      {/* Continue learning */}
      {nextLesson && (
        <Card className="bg-gradient-to-br from-primary to-primary-deep text-white">
          <p className="text-xs font-medium uppercase tracking-wide text-white/70">
            {nextUnit?.emoji} {nextUnit?.title}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold">
            {nextLesson.emoji} {nextLesson.title}
          </h2>
          <p className="mt-1 text-sm text-white/80">{nextLesson.goal}</p>
          <Link to={`/learn/${nextLesson.id}`} className="mt-4 block">
            <Button variant="gold" size="lg" className="w-full">
              {progress.completedLessons.includes(nextLesson.id) ? 'Review lesson' : 'Start lesson'}
            </Button>
          </Link>
        </Card>
      )}

      {/* Review queue */}
      {(due > 0 || newCount > 0) && (
        <Card className="flex items-center justify-between border-accent/20 bg-accent-soft">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Daily review</h2>
            <p className="text-sm text-ink-muted">
              {due > 0
                ? `${due} card${due === 1 ? '' : 's'} ready to revise`
                : `${newCount} new phrases to learn`}
            </p>
          </div>
          <Link to="/review">
            <Button variant={due > 0 ? 'accent' : 'secondary'} size="sm">
              {due > 0 ? 'Revise' : 'Practice'}
            </Button>
          </Link>
        </Card>
      )}

      {/* Practice mistakes */}
      {mistakeCount > 0 && (
        <Card className="flex items-center justify-between border-warning/20 bg-warning-soft">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Practice mistakes</h2>
            <p className="text-sm text-ink-muted">
              {mistakeCount} phrase{mistakeCount === 1 ? '' : 's'} to nail down
            </p>
          </div>
          <Link to="/practice/mistakes">
            <Button variant="gold" size="sm">Fix them</Button>
          </Link>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link to="/practice">
          <Card className="h-full text-center transition hover:border-primary/30">
            <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-grape-soft">
              <svg width={24} height={24} viewBox="0 0 24 24" fill="var(--color-grape)"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 14.5v-2h2v2h-2zm0-4v-7h2v7h-2z"/></svg>
            </div>
            <div className="font-display font-semibold text-ink">Quick quiz</div>
          </Card>
        </Link>
        <Link to="/progress">
          <Card className="h-full text-center transition hover:border-primary/30">
            <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-soft">
              <svg width={24} height={24} viewBox="0 0 24 24" fill="var(--color-secondary)"><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/></svg>
            </div>
            <div className="font-display font-semibold text-ink">Badges</div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
