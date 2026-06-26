import { useCallback, useSyncExternalStore } from 'react';

const AUDIO_BASE = '/audio';

export interface PlayOptions {
  fallbackText?: string;
  lang?: string;
}

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

// ── Singleton audio element shared across all hook instances ──

let sharedAudio: HTMLAudioElement | null = null;
let currentClipId: string | null = null;
let listeners = new Set<() => void>();

function getAudio(): HTMLAudioElement {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = 'auto';
  }
  return sharedAudio;
}

function notify() {
  listeners.forEach((fn) => fn());
}

function getPlayingId() {
  return currentClipId;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

// ── Prefetch cache ──

const prefetched = new Set<string>();

export function prefetchAudio(clipIds: string[]) {
  for (const id of clipIds) {
    if (prefetched.has(id)) continue;
    prefetched.add(id);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'fetch';
    link.href = `${AUDIO_BASE}/${id}.mp3`;
    document.head.appendChild(link);
  }
}

// ── Hook ──

export function useAudio() {
  const playingId = useSyncExternalStore(subscribe, getPlayingId, () => null);

  const play = useCallback((clipId: string, opts: PlayOptions = {}) => {
    const audio = getAudio();

    audio.pause();
    audio.onended = null;
    audio.onerror = null;

    const url = `${AUDIO_BASE}/${clipId}.mp3`;
    const needsSrcChange = audio.src !== new URL(url, location.href).href;

    if (needsSrcChange) {
      audio.src = url;
    }

    currentClipId = clipId;
    notify();

    const done = () => {
      if (currentClipId === clipId) {
        currentClipId = null;
        notify();
      }
    };

    audio.onended = done;
    audio.onerror = () => {
      if (opts.fallbackText) speak(opts.fallbackText, opts.lang);
      done();
    };

    audio.currentTime = 0;
    audio.play().catch(() => {
      if (opts.fallbackText) speak(opts.fallbackText, opts.lang);
      done();
    });
  }, []);

  return { play, playingId };
}
