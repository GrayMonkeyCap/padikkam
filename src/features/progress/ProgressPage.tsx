import { useStore } from '../../storage/store';
import { BADGES, levelFromXp } from '../../lib/xp';
import { orderedLessons } from '../../content';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ProgressRing } from '../../components/ProgressRing';
import { Ammu } from '../../components/Ammu';
import { BadgeIcon } from '../../components/TopicIcon';

const GOAL_OPTIONS = [10, 20, 30, 50];

export function ProgressPage() {
  const progress = useStore((s) => s.progress);
  const srs = useStore((s) => s.srs);
  const setDailyGoal = useStore((s) => s.setDailyGoal);
  const resetAll = useStore((s) => s.resetAll);

  const { level, into, need } = levelFromXp(progress.xp);
  const learnedCount = Object.keys(srs).length;
  const lessonsDone = progress.completedLessons.length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Your progress</h1>
        <p className="text-sm text-ink-muted">Track your streaks, badges, and milestones.</p>
      </header>

      {/* Level card */}
      <Card className="bg-grape-soft border-grape/20">
        <div className="flex items-center gap-5">
          <ProgressRing value={into / need} label={`L${level}`} sublabel={`${into}/${need}`} />
          <div className="grid flex-1 grid-cols-2 gap-3 text-center">
            <Stat value={progress.xp} label="Total XP" />
            <Stat value={progress.streak} label="Day streak" icon="streak" />
            <Stat value={learnedCount} label="Phrases" />
            <Stat value={`${lessonsDone}/${orderedLessons.length}`} label="Lessons" />
          </div>
        </div>
      </Card>

      {/* Streak freezes */}
      <Card className="flex items-center justify-between bg-primary-soft/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="var(--color-primary)"><path d="M12 2C7 2 3 7 3 12c0 3 1.5 5.5 4 7l1-2c-1.5-1-2.5-3-2.5-5 0-3.5 3-6.5 6.5-6.5S18.5 8.5 18.5 12c0 2-1 4-2.5 5l1 2c2.5-1.5 4-4 4-7 0-5-4-10-9-10z"/></svg>
          </div>
          <div>
            <div className="font-display font-bold text-ink">Streak freezes</div>
            <div className="text-xs text-ink-muted">Automatically saves your streak if you miss a day.</div>
          </div>
        </div>
        <div className="font-display text-2xl font-bold text-primary-deep">{progress.streakFreezes}</div>
      </Card>

      {/* Badges */}
      <section>
        <h2 className="mb-2 font-display font-bold text-ink">Badges</h2>
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map((b) => {
            const earned = progress.badges.includes(b.id);
            return (
              <Card
                key={b.id}
                className={`flex flex-col items-center gap-1 p-3 text-center ${
                  earned ? 'border-secondary/40 bg-secondary-soft' : 'opacity-50'
                }`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${earned ? 'bg-secondary/20' : 'bg-surface-sunk'}`}>
                  {earned ? (
                    <BadgeIcon emoji={b.emoji} size={26} color="var(--color-secondary)" />
                  ) : (
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="var(--color-ink-faint)"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4" fill="none" stroke="var(--color-ink-faint)" strokeWidth={2}/></svg>
                  )}
                </div>
                <div className="text-xs font-display font-bold text-ink">{b.title}</div>
                <div className="text-[10px] leading-tight text-ink-faint">{b.description}</div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Daily goal */}
      <section>
        <h2 className="mb-2 font-display font-bold text-ink">Daily goal</h2>
        <div className="grid grid-cols-4 gap-2">
          {GOAL_OPTIONS.map((g) => (
            <button
              key={g}
              onClick={() => setDailyGoal(g)}
              className={`rounded-full border-2 py-3 text-center font-display font-semibold transition ${
                progress.dailyGoal === g
                  ? 'border-primary bg-primary-soft text-primary-deep shadow-[0_4px_0_var(--color-primary)] active:translate-y-[2px] active:shadow-none'
                  : 'border-border bg-surface-card text-ink-muted hover:border-primary/30'
              }`}
            >
              {g}
              <div className="text-[10px] font-normal text-ink-faint">XP</div>
            </button>
          ))}
        </div>
      </section>

      <div className="flex justify-center py-2">
        <Ammu state="idle" size={80} />
      </div>

      <section>
        <Button
          variant="ghost"
          className="w-full text-accent"
          onClick={() => {
            if (confirm('Reset all progress? This cannot be undone.')) resetAll();
          }}
        >
          Reset all progress
        </Button>
      </section>
    </div>
  );
}

function Stat({ value, label, icon }: { value: string | number; label: string; icon?: string }) {
  return (
    <div>
      <div className="flex items-center justify-center gap-1">
        {icon === 'streak' && (
          <svg width={14} height={14} viewBox="0 0 24 24" fill="var(--color-secondary)"><path d="M12 2c-1 4-4 6-6 10a7 7 0 1014 0C18 8 15 6 12 2z"/></svg>
        )}
        <span className="font-display text-xl font-bold text-ink">{value}</span>
      </div>
      <div className="text-xs text-ink-faint">{label}</div>
    </div>
  );
}
