import { useRef, useState } from 'react';
import { useAudio } from '../audio/useAudio';

interface Props {
  clipId: string;
  fallbackText?: string;
  roman: string;
}

type State = 'idle' | 'recording' | 'recorded' | 'denied' | 'unsupported';

export function PronouncePractice({ clipId, fallbackText, roman }: Props) {
  const { play } = useAudio();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>('idle');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const myAudioRef = useRef<HTMLAudioElement | null>(null);
  const [myUrl, setMyUrl] = useState<string | null>(null);

  const startRecording = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof MediaRecorder === 'undefined') {
      setState('unsupported');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (myUrl) URL.revokeObjectURL(myUrl);
        setMyUrl(URL.createObjectURL(blob));
        setState('recorded');
        stream.getTracks().forEach((t) => t.stop());
      };
      recorderRef.current = recorder;
      recorder.start();
      setState('recording');
    } catch {
      setState('denied');
    }
  };

  const stopRecording = () => recorderRef.current?.stop();
  const playMine = () => {
    if (!myUrl) return;
    myAudioRef.current?.pause();
    const a = new Audio(myUrl);
    myAudioRef.current = a;
    a.play().catch(() => {});
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent transition hover:bg-accent-soft/80"
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a4 4 0 014 4v7a4 4 0 01-8 0V5a4 4 0 014-4zM6 11a1 1 0 012 0 4 4 0 008 0 1 1 0 012 0 6 6 0 01-5 5.91V20h3a1 1 0 010 2H9a1 1 0 010-2h3v-3.09A6 6 0 016 11z"/></svg>
        Practice saying it
      </button>
    );
  }

  return (
    <div className="rounded-[18px] border border-border bg-surface-sunk p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-display font-semibold text-ink">
          <svg className="mr-1 inline" width={14} height={14} viewBox="0 0 24 24" fill="var(--color-accent)"><path d="M12 1a4 4 0 014 4v7a4 4 0 01-8 0V5a4 4 0 014-4zM6 11a1 1 0 012 0 4 4 0 008 0 1 1 0 012 0 6 6 0 01-5 5.91V20h3a1 1 0 010 2H9a1 1 0 010-2h3v-3.09A6 6 0 016 11z"/></svg>
          Say: "{roman}"
        </span>
        <button onClick={() => setOpen(false)} className="text-xs text-ink-faint hover:text-ink-muted">
          close
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => play(clipId, { fallbackText, lang: 'ml-IN' })}
          className="rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-white shadow-[0_3px_0_var(--color-primary-deep)] active:translate-y-[2px] active:shadow-none"
        >
          Native
        </button>

        {state === 'recording' ? (
          <button
            onClick={stopRecording}
            className="animate-pulse rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-white shadow-[0_3px_0_var(--color-accent-deep)] active:translate-y-[2px] active:shadow-none"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-white shadow-[0_3px_0_var(--color-accent-deep)] active:translate-y-[2px] active:shadow-none"
          >
            Record
          </button>
        )}

        {state === 'recorded' && myUrl && (
          <button
            onClick={playMine}
            className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-ink shadow-[0_3px_0_var(--color-secondary-deep)] active:translate-y-[2px] active:shadow-none"
          >
            My voice
          </button>
        )}
      </div>

      {state === 'recorded' && (
        <p className="mt-2 text-xs text-ink-faint">Compare yours to the native clip. Close? Sounds great!</p>
      )}
      {state === 'denied' && (
        <p className="mt-2 text-xs text-accent">Mic permission denied — allow it in your browser to practice.</p>
      )}
      {state === 'unsupported' && (
        <p className="mt-2 text-xs text-ink-faint">Recording isn't supported on this browser. Try Chrome.</p>
      )}
    </div>
  );
}
