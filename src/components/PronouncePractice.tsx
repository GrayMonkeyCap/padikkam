import { useRef, useState } from 'react';
import { useAudio } from '../audio/useAudio';

interface Props {
  clipId: string;
  fallbackText?: string;
  /** The romanized phrase, shown as a target to read aloud. */
  roman: string;
}

type State = 'idle' | 'recording' | 'recorded' | 'denied' | 'unsupported';

/**
 * Speaking practice via "shadowing": hear the native clip, record yourself,
 * then play both back to compare. Uses MediaRecorder — no server, no ASR.
 */
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
        className="inline-flex items-center gap-1.5 rounded-full bg-coral-400/15 px-3 py-1.5 text-sm font-medium text-coral-500 transition hover:bg-coral-400/25"
      >
        🎤 Practice saying it
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-teal-100 bg-teal-50/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-teal-900">🎤 Say: “{roman}”</span>
        <button onClick={() => setOpen(false)} className="text-xs text-ink/40">
          close
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => play(clipId, { fallbackText, lang: 'ml-IN' })}
          className="rounded-full bg-teal-700 px-3 py-1.5 text-sm font-medium text-white"
        >
          🔊 Native
        </button>

        {state === 'recording' ? (
          <button
            onClick={stopRecording}
            className="animate-pulse rounded-full bg-coral-500 px-3 py-1.5 text-sm font-medium text-white"
          >
            ⏹ Stop
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="rounded-full bg-coral-400 px-3 py-1.5 text-sm font-medium text-white"
          >
            ● Record
          </button>
        )}

        {state === 'recorded' && myUrl && (
          <button
            onClick={playMine}
            className="rounded-full bg-gold-400 px-3 py-1.5 text-sm font-medium text-ink"
          >
            ▶ My voice
          </button>
        )}
      </div>

      {state === 'recorded' && (
        <p className="mt-2 text-xs text-ink/50">Compare yours to the native clip. Close? Sounds great. 👏</p>
      )}
      {state === 'denied' && (
        <p className="mt-2 text-xs text-coral-500">Mic permission denied — allow it in your browser to practice.</p>
      )}
      {state === 'unsupported' && (
        <p className="mt-2 text-xs text-ink/50">Recording isn’t supported on this browser. Try Chrome.</p>
      )}
    </div>
  );
}
