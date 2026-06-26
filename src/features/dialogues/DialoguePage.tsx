import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDialogue, lineAudioId } from '../../content';
import { useAudio, prefetchAudio } from '../../audio/useAudio';
import { useStore } from '../../storage/store';
import { XP } from '../../lib/xp';
import { Button } from '../../components/Button';
import { AudioButton } from '../../components/AudioButton';
import { Ammu } from '../../components/Ammu';

export function DialoguePage() {
  const { dialogueId = '' } = useParams();
  const dialogue = getDialogue(dialogueId);
  const { play } = useAudio();
  const addXp = useStore((s) => s.addXp);

  const [roleplay, setRoleplay] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [rewarded, setRewarded] = useState(false);

  const learnerSpeaker = useMemo(() => {
    if (!dialogue) return '';
    const you = dialogue.lines.find((l) => /you/i.test(l.speaker));
    return you ? you.speaker : dialogue.lines[1]?.speaker ?? '';
  }, [dialogue]);

  useEffect(() => {
    if (!dialogue) return;
    const clipIds = dialogue.lines.map((line, i) => lineAudioId(dialogue.id, i, line));
    prefetchAudio(clipIds);
  }, [dialogue]);

  if (!dialogue) {
    return (
      <div className="space-y-4 pt-16 text-center">
        <Ammu state="thinking" size={96} />
        <p className="text-ink-muted">Conversation not found.</p>
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
      <Link to="/learn" className="inline-flex items-center gap-1 text-sm font-medium text-primary-deep hover:text-primary">
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        Back
      </Link>

      <header>
        <h1 className="font-display text-2xl font-bold text-ink">
          <svg className="mr-2 inline" width={24} height={24} viewBox="0 0 24 24" fill="var(--color-secondary)"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
          {dialogue.scenario}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">{dialogue.setup}</p>
      </header>

      <div className="flex gap-2">
        <Button onClick={playAll} className="flex-1">
          Play conversation
        </Button>
        <Button
          variant={roleplay ? 'gold' : 'secondary'}
          onClick={() => {
            setRoleplay((r) => !r);
            setRevealed(new Set());
          }}
        >
          Role-play
        </Button>
      </div>

      {roleplay && (
        <div className="flex items-center gap-3 rounded-2xl bg-grape-soft px-4 py-3">
          <Ammu state="teaching" size={40} />
          <p className="text-sm text-ink-muted">
            Your turn as <strong className="text-grape-deep">{learnerSpeaker}</strong>. Try to say each line, then tap to check.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {dialogue.lines.map((line, i) => {
          const isLearner = line.speaker === learnerSpeaker;
          const hidden = roleplay && isLearner && !revealed.has(i);

          return (
            <div key={i} className={`flex ${isLearner ? 'justify-end' : 'justify-start'}`}>
              <div className="flex max-w-[85%] items-end gap-2">
                {!isLearner && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-sunk text-xs font-display font-bold text-ink-muted">
                    {line.speaker.charAt(0)}
                  </div>
                )}
                <div
                  className={`rounded-[18px] border px-4 py-3 ${
                    isLearner
                      ? 'rounded-br-[5px] border-primary/20 bg-primary text-white'
                      : 'rounded-bl-[5px] border-border bg-surface-card'
                  } ${hidden ? 'cursor-pointer' : ''}`}
                  onClick={hidden ? () => toggleReveal(i) : undefined}
                >
                  <div
                    className={`mb-1 text-xs font-display font-bold ${isLearner ? 'text-white/70' : 'text-primary'}`}
                  >
                    {line.speaker}
                  </div>

                  {hidden ? (
                    <div className="py-2 text-center text-sm text-white/80">
                      Your line — tap to reveal
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <AudioButton
                        clipId={lineAudioId(dialogue.id, i, line)}
                        fallbackText={line.roman}
                        size="sm"
                      />
                      <div>
                        <div className="font-display font-semibold">{line.roman}</div>
                        <div className={isLearner ? 'text-white/70' : 'text-ink-muted'} lang="hi">
                          {line.deva}
                        </div>
                        <div className={`mt-1 text-sm ${isLearner ? 'text-white/80' : 'text-ink/70'}`}>
                          {line.english}
                        </div>
                        <div className={`text-sm ${isLearner ? 'text-white/60' : 'text-ink/50'}`} lang="hi">
                          {line.hindi}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {isLearner && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-display font-bold text-primary-deep">
                    You
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
