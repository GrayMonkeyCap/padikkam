import { Link, useParams } from 'react-router-dom';
import { getLesson, phrasesForLesson, dialoguesForLesson, getUnit, getTip, phraseAudioId } from '../../content';
import { useStore } from '../../storage/store';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { PhraseDisplay } from '../../components/PhraseDisplay';
import { LessonTip } from '../../components/LessonTip';
import { PronouncePractice } from '../../components/PronouncePractice';

export function LessonDetailPage() {
  const { lessonId = '' } = useParams();
  const lesson = getLesson(lessonId);
  const completeLesson = useStore((s) => s.completeLesson);
  const completed = useStore((s) => s.progress.completedLessons.includes(lessonId));
  const level = useStore((s) => s.progress.lessonLevels[lessonId] ?? 0);

  if (!lesson) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-ink/60">Lesson not found.</p>
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
      <Link to="/learn" className="text-sm font-medium text-teal-700">
        ← {unit?.title}
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-teal-900">
          {lesson.emoji} {lesson.title}
        </h1>
        <p className="mt-1 text-sm text-ink/60">{lesson.goal}</p>
        {level > 0 && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-gold-300/30 px-3 py-1 text-xs font-bold text-gold-600">
            {'👑'.repeat(level)} Crown {level}/5
          </div>
        )}
      </header>

      {tip && <LessonTip tip={tip} />}

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink/40">Phrases</h2>
        {phrases.map((p) => (
          <Card key={p.id} className="space-y-3">
            <PhraseDisplay phrase={p} />
            <PronouncePractice clipId={phraseAudioId(p)} fallbackText={p.script ?? p.roman} roman={p.roman} />
          </Card>
        ))}
      </section>

      {dialogues.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink/40">Conversation</h2>
          {dialogues.map((d) => (
            <Link key={d.id} to={`/dialogue/${d.id}`} className="block">
              <Card className="flex items-center gap-3 hover:border-teal-300">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-300/40 text-xl">
                  💬
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-teal-900">{d.scenario}</div>
                  <div className="text-xs text-ink/55">{d.setup}</div>
                </div>
                <span className="text-teal-600">→</span>
              </Card>
            </Link>
          ))}
        </section>
      )}

      <div className="space-y-2.5 pt-2">
        <Link to={`/quiz/${lesson.id}`} className="block">
          <Button size="lg" className="w-full">
            Practice quiz →
          </Button>
        </Link>
        <Button
          variant={completed ? 'secondary' : 'gold'}
          size="lg"
          className="w-full"
          onClick={() => completeLesson(lesson.id)}
          disabled={completed}
        >
          {completed ? '✓ Lesson complete' : 'Mark as complete (+20 XP)'}
        </Button>
      </div>
    </div>
  );
}
