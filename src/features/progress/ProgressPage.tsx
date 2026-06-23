import { useStore } from '../../storage/store';
import { BADGES, levelFromXp } from '../../lib/xp';
import { orderedLessons } from '../../content';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ProgressRing } from '../../components/ProgressRing';

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
        <h1 className="text-2xl font-bold text-teal-900">Your progress</h1>
        <p className="text-sm text-ink/60">Every phrase is a step closer to your first conversation.</p>
      </header>

      <Card className="flex items-center gap-5">
        <ProgressRing value={into / need} label={`L${level}`} sublabel={`${into}/${need}`} />
        <div className="grid flex-1 grid-cols-2 gap-3 text-center">
          <Stat value={progress.xp} label="Total XP" />
          <Stat value={progress.streak} label="Day streak" />
          <Stat value={learnedCount} label="Phrases" />
          <Stat value={`${lessonsDone}/${orderedLessons.length}`} label="Lessons" />
        </div>
      </Card>

      <Card className="flex items-center justify-between bg-teal-50/40">
        <div>
          <div className="font-bold text-teal-900">❄️ Streak freezes</div>
          <div className="text-xs text-ink/55">Automatically saves your streak if you miss a day.</div>
        </div>
        <div className="text-2xl font-bold text-teal-700">{progress.streakFreezes}</div>
      </Card>

      {/* Badges */}
      <section>
        <h2 className="mb-2 font-bold text-teal-900">Badges</h2>
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map((b) => {
            const earned = progress.badges.includes(b.id);
            return (
              <Card
                key={b.id}
                className={`flex flex-col items-center gap-1 p-3 text-center ${
                  earned ? 'border-gold-400 bg-gold-300/15' : 'opacity-50'
                }`}
              >
                <div className="text-3xl">{earned ? b.emoji : '🔒'}</div>
                <div className="text-xs font-bold text-teal-900">{b.title}</div>
                <div className="text-[10px] leading-tight text-ink/50">{b.description}</div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Daily goal */}
      <section>
        <h2 className="mb-2 font-bold text-teal-900">Daily goal</h2>
        <div className="grid grid-cols-4 gap-2">
          {GOAL_OPTIONS.map((g) => (
            <button
              key={g}
              onClick={() => setDailyGoal(g)}
              className={`rounded-2xl border-2 py-3 text-center font-semibold transition ${
                progress.dailyGoal === g
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-teal-100 bg-white text-ink/60'
              }`}
            >
              {g}
              <div className="text-[10px] font-normal text-ink/40">XP</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <Button
          variant="ghost"
          className="w-full text-coral-500"
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

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <div className="text-xl font-bold text-teal-900">{value}</div>
      <div className="text-xs text-ink/50">{label}</div>
    </div>
  );
}
