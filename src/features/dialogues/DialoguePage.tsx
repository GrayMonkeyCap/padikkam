import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDialogue, lineAudioId } from '../../content';
import { useAudio } from '../../audio/useAudio';
import { useStore } from '../../storage/store';
import { XP } from '../../lib/xp';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { AudioButton } from '../../components/AudioButton';

export function DialoguePage() {
  const { dialogueId = '' } = useParams();
  const dialogue = getDialogue(dialogueId);
  const { play } = useAudio();
  const addXp = useStore((s) => s.addXp);

  const [roleplay, setRoleplay] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [rewarded, setRewarded] = useState(false);

  // The learner plays "You" if present, otherwise the second speaker in the convo.
  const learnerSpeaker = useMemo(() => {
    if (!dialogue) return '';
    const you = dialogue.lines.find((l) => /you/i.test(l.speaker));
    return you ? you.speaker : dialogue.lines[1]?.speaker ?? '';
  }, [dialogue]);

  if (!dialogue) {
    return (
      <div className="space-y-4 pt-16 text-center">
        <p className="text-ink/60">Conversation not found.</p>
        <Link to="/learn">
          <Button variant="secondary">Back</Button>
        </Link>
      </div>
    );
  }

  const playAll = async () => {
    for (let i = 0; i < dialogue.lines.length; i++) {
      const line = dialogue.lines[i];
      play(lineAudioId(dialogue.id, i, line), { fallbackText: line.roman, lang: 'ml-IN' });
      // Space out playback so clips don't overlap (rough estimate).
      await new Promise((r) => setTimeout(r, 2200));
    }
    if (!rewarded) {
      addXp(XP.dialogueComplete);
      setRewarded(true);
    }
  };

  const toggleReveal = (i: number) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  return (
    <div className="space-y-5">
      <Link to="/learn" className="text-sm font-medium text-teal-700">
        ← Back
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-teal-900">💬 {dialogue.scenario}</h1>
        <p className="mt-1 text-sm text-ink/60">{dialogue.setup}</p>
      </header>

      <div className="flex gap-2">
        <Button onClick={playAll} className="flex-1">
          ▶ Play conversation
        </Button>
        <Button
          variant={roleplay ? 'gold' : 'secondary'}
          onClick={() => {
            setRoleplay((r) => !r);
            setRevealed(new Set());
          }}
        >
          🎭 Role-play
        </Button>
      </div>

      {roleplay && (
        <p className="rounded-xl bg-gold-300/20 px-3 py-2 text-center text-sm text-ink/70">
          Your turn as <strong>{learnerSpeaker}</strong>. Try to say each line, then tap to check.
        </p>
      )}

      <div className="space-y-3">
        {dialogue.lines.map((line, i) => {
          const isLearner = line.speaker === learnerSpeaker;
          const hidden = roleplay && isLearner && !revealed.has(i);

          return (
            <div key={i} className={`flex ${isLearner ? 'justify-end' : 'justify-start'}`}>
              <Card
                className={`max-w-[85%] ${
                  isLearner ? 'bg-teal-700 text-white' : 'bg-white'
                } ${hidden ? 'cursor-pointer' : ''}`}
                onClick={hidden ? () => toggleReveal(i) : undefined}
              >
                <div
                  className={`mb-1 text-xs font-bold ${isLearner ? 'text-teal-100' : 'text-teal-600'}`}
                >
                  {line.speaker}
                </div>

                {hidden ? (
                  <div className="py-3 text-center text-sm text-teal-100/90">
                    🙈 Your line — tap to reveal
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <AudioButton
                      clipId={lineAudioId(dialogue.id, i, line)}
                      fallbackText={line.roman}
                      size="sm"
                    />
                    <div>
                      <div className="font-semibold">{line.roman}</div>
                      <div className={isLearner ? 'text-teal-100/80' : 'text-teal-700/70'} lang="hi">
                        {line.deva}
                      </div>
                      <div className={`mt-1 text-sm ${isLearner ? 'text-teal-50/90' : 'text-ink/70'}`}>
                        {line.english}
                      </div>
                      <div className={`text-sm ${isLearner ? 'text-teal-50/70' : 'text-ink/50'}`} lang="hi">
                        {line.hindi}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
