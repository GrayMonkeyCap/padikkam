import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../storage/store';
import { orderedLessons, phrasesForLesson } from '../../content';
import { todayKey } from '../../lib/dates';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Ammu } from '../../components/Ammu';
import type { Progress, SrsState, SrsCard } from '../../storage/repository';

function makeSrsCard(daysAgo: number, ease = 2.5, interval = 1, reps = 1): SrsCard {
  const now = Date.now();
  return {
    ease,
    interval,
    reps,
    lapses: 0,
    due: now - daysAgo * 86_400_000,
    lastReviewed: now - (daysAgo + 1) * 86_400_000,
  };
}

type ProfileKey = 'new' | 'halfway' | 'complete';

interface ProfileDef {
  key: ProfileKey;
  title: string;
  description: string;
  ammuState: 'greeting' | 'encouraging' | 'celebrating';
}

const PROFILES: ProfileDef[] = [
  {
    key: 'new',
    title: 'Fresh Start',
    description: 'Brand new learner. No lessons completed, no XP, no reviews.',
    ammuState: 'greeting',
  },
  {
    key: 'halfway',
    title: 'Halfway There',
    description: '16 of 32 lessons done, ~500 XP, 7-day streak, some SRS cards due.',
    ammuState: 'encouraging',
  },
  {
    key: 'complete',
    title: 'Fully Complete',
    description: 'All 32 lessons done, max crowns, 2000+ XP, 30-day streak, all cards reviewed.',
    ammuState: 'celebrating',
  },
];

function buildProfile(key: ProfileKey): { progress: Progress; srs: SrsState } {
  const today = todayKey();

  if (key === 'new') {
    return {
      progress: {
        xp: 0,
        streak: 0,
        lastActiveDate: null,
        todayXp: 0,
        dailyGoal: 30,
        streakFreezes: 2,
        completedLessons: [],
        lessonMastery: {},
        lessonLevels: {},
        mistakes: [],
        badges: [],
      },
      srs: {},
    };
  }

  if (key === 'halfway') {
    const halfLessons = orderedLessons.slice(0, 16);
    const completedIds = halfLessons.map((l) => l.id);
    const mastery: Record<string, number> = {};
    const levels: Record<string, number> = {};
    const srs: SrsState = {};

    halfLessons.forEach((lesson, li) => {
      mastery[lesson.id] = 60 + Math.floor(Math.random() * 30);
      levels[lesson.id] = li < 8 ? 3 : 1;
      phrasesForLesson(lesson.id).forEach((p) => {
        srs[p.id] = makeSrsCard(li < 8 ? 0 : 2, 2.5, li < 8 ? 4 : 1, li < 8 ? 3 : 1);
      });
    });

    return {
      progress: {
        xp: 520,
        streak: 7,
        lastActiveDate: today,
        todayXp: 15,
        dailyGoal: 30,
        streakFreezes: 1,
        completedLessons: completedIds,
        lessonMastery: mastery,
        lessonLevels: levels,
        mistakes: ['p-venda', 'p-kshamikkuka'],
        badges: ['first-words', 'on-a-roll', 'week-strong', 'chatty', 'centurion', 'halfway'],
      },
      srs,
    };
  }

  // complete
  const allIds = orderedLessons.map((l) => l.id);
  const mastery: Record<string, number> = {};
  const levels: Record<string, number> = {};
  const srs: SrsState = {};

  orderedLessons.forEach((lesson) => {
    mastery[lesson.id] = 85 + Math.floor(Math.random() * 16);
    levels[lesson.id] = 5;
    phrasesForLesson(lesson.id).forEach((p) => {
      srs[p.id] = makeSrsCard(0, 2.8, 14, 6);
    });
  });

  return {
    progress: {
      xp: 2400,
      streak: 30,
      lastActiveDate: today,
      todayXp: 45,
      dailyGoal: 30,
      streakFreezes: 3,
      completedLessons: allIds,
      lessonMastery: mastery,
      lessonLevels: levels,
      mistakes: [],
      badges: ['first-words', 'on-a-roll', 'week-strong', 'chatty', 'centurion', 'halfway', 'fluent-track'],
    },
    srs,
  };
}

export function AdminPage() {
  const loadProfile = useStore((s) => s.loadProfile);
  const navigate = useNavigate();
  const [applied, setApplied] = useState<ProfileKey | null>(null);

  const apply = (key: ProfileKey) => {
    const { progress, srs } = buildProfile(key);
    loadProfile(progress, srs);
    setApplied(key);
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Test Profiles</h1>
        <p className="text-sm text-ink-muted">Pick a profile to replace all saved data.</p>
      </header>

      <div className="space-y-3">
        {PROFILES.map((p) => {
          const isApplied = applied === p.key;
          return (
            <Card
              key={p.key}
              className={`flex items-center gap-4 transition ${isApplied ? 'border-success/40 bg-success-soft' : ''}`}
            >
              <Ammu state={p.ammuState} size={56} />
              <div className="flex-1">
                <h2 className="font-display font-bold text-ink">{p.title}</h2>
                <p className="text-xs text-ink-muted">{p.description}</p>
              </div>
              <Button
                variant={isApplied ? 'secondary' : 'gold'}
                size="sm"
                onClick={() => apply(p.key)}
                disabled={isApplied}
              >
                {isApplied ? 'Applied' : 'Apply'}
              </Button>
            </Card>
          );
        })}
      </div>

      {applied && (
        <div className="flex justify-center pt-2">
          <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
        </div>
      )}
    </div>
  );
}
