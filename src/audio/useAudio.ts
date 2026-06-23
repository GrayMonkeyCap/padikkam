import { useCallback, useRef, useState } from 'react';

const AUDIO_BASE = '/audio';

export interface PlayOptions {
  /** Text spoken by the browser TTS fallback if the MP3 is missing. */
  fallbackText?: string;
  /** BCP-47 lang for the fallback voice. */
  lang?: string;
}

/** Try the browser's speech synthesis as a fallback (Malayalam may be unavailable). */
function speak(text: string, lang = 'ml-IN'): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

/**
 * Plays a pre-generated clip `/audio/<clipId>.mp3`.
 * If the clip 404s (not generated yet), falls back to browser TTS so the app
 * is still usable before the audio pipeline has run.
 */
export function useAudio() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((clipId: string, opts: PlayOptions = {}) => {
    // Stop anything currently playing.
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(`${AUDIO_BASE}/${clipId}.mp3`);
    audioRef.current = audio;
    setPlayingId(clipId);

    const done = () => setPlayingId((cur) => (cur === clipId ? null : cur));
    audio.addEventListener('ended', done);
    audio.addEventListener('error', () => {
      // No clip on disk yet — use the browser voice if we have text.
      if (opts.fallbackText) speak(opts.fallbackText, opts.lang);
      done();
    });

    audio.play().catch(() => {
      if (opts.fallbackText) speak(opts.fallbackText, opts.lang);
      done();
    });
  }, []);

  return { play, playingId };
}
