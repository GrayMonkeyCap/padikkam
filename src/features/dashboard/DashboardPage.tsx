import { Link } from 'react-router-dom';
import { useStore } from '../../storage/store';
import { dueCount, newPhrases } from '../../srs/queue';
import { orderedLessons, getUnit } from '../../content';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ProgressRing } from '../../components/ProgressRing';
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
        <div>
          <p className="text-sm text-ink/50">{greeting()} 👋</p>
          <h1 className="text-2xl font-bold text-teal-900">Padikkam</h1>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-gold-300/30 px-3 py-1.5 text-sm font-bold text-gold-600">
          🔥 {progress.streak}
          <span className="font-medium text-ink/50">day{progress.streak === 1 ? '' : 's'}</span>
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
          <h2 className="text-lg font-bold text-teal-900">
            {goalMet ? 'Goal smashed! 🎉' : "Today's goal"}
          </h2>
          <p className="mt-1 text-sm text-ink/60">
            {goalMet
              ? 'Every bit extra makes it stick. Keep going!'
              : `You're ${Math.max(0, progress.dailyGoal - progress.todayXp)} XP away. You've got this.`}
          </p>
          <p className="mt-2 text-xs font-medium text-teal-700">Level {level} · {progress.xp} XP total</p>
        </div>
      </Card>

      {/* Continue learning */}
      {nextLesson && (
        <Card className="bg-gradient-to-br from-teal-700 to-teal-600 text-white">
          <p className="text-xs font-medium uppercase tracking-wide text-teal-100">
            {nextUnit?.emoji} {nextUnit?.title}
          </p>
          <h2 className="mt-1 text-xl font-bold">
            {nextLesson.emoji} {nextLesson.title}
          </h2>
          <p className="mt-1 text-sm text-teal-50/90">{nextLesson.goal}</p>
          <Link to={`/learn/${nextLesson.id}`} className="mt-4 block">
            <Button variant="gold" size="lg" className="w-full">
              {progress.completedLessons.includes(nextLesson.id) ? 'Review lesson' : 'Start lesson'} →
            </Button>
          </Link>
        </Card>
      )}

      {/* Review queue */}
      <Card className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-teal-900">Daily review</h2>
          <p className="text-sm text-ink/60">
            {due > 0
              ? `${due} card${due === 1 ? '' : 's'} ready to revise`
              : newCount > 0
                ? `${newCount} new phrases to learn`
                : 'All caught up — beautifully done!'}
          </p>
        </div>
        <Link to="/review">
          <Button variant={due > 0 ? 'primary' : 'secondary'}>
            {due > 0 ? 'Revise' : 'Practice'}
          </Button>
        </Link>
      </Card>

      {/* Practice mistakes */}
      {mistakeCount > 0 && (
        <Card className="flex items-center justify-between border-coral-400/40 bg-coral-400/5">
          <div>
            <h2 className="text-lg font-bold text-teal-900">Practice mistakes</h2>
            <p className="text-sm text-ink/60">
              {mistakeCount} phrase{mistakeCount === 1 ? '' : 's'} to nail down
            </p>
          </div>
          <Link to="/practice/mistakes">
            <Button variant="gold">Fix them</Button>
          </Link>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link to="/practice">
          <Card className="h-full text-center transition hover:border-teal-300">
            <div className="text-3xl">🎯</div>
            <div className="mt-1 font-semibold text-teal-900">Quick quiz</div>
          </Card>
        </Link>
        <Link to="/progress">
          <Card className="h-full text-center transition hover:border-teal-300">
            <div className="text-3xl">🏅</div>
            <div className="mt-1 font-semibold text-teal-900">Badges</div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
