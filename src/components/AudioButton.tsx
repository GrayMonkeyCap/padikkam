import { useAudio } from '../audio/useAudio';

interface Props {
  clipId: string;
  /** Text for the browser-TTS fallback (Malayalam script preferred). */
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const dims = {
  sm: 'h-9 w-9 text-base',
  md: 'h-12 w-12 text-xl',
  lg: 'h-16 w-16 text-2xl',
} as const;

/** A round speaker button that plays a clip and pulses while playing. */
export function AudioButton({ clipId, fallbackText, size = 'md', label }: Props) {
  const { play, playingId } = useAudio();
  const isPlaying = playingId === clipId;

  return (
    <button
      type="button"
      aria-label={label ?? 'Play pronunciation'}
      onClick={() => play(clipId, { fallbackText, lang: 'ml-IN' })}
      className={`${dims[size]} inline-flex shrink-0 items-center justify-center rounded-full bg-teal-700 text-white shadow-sm transition active:scale-90 hover:bg-teal-800 ${
        isPlaying ? 'animate-[pop_0.6s_ease-in-out_infinite] ring-4 ring-teal-200' : ''
      }`}
    >
      {isPlaying ? '🔊' : '🔈'}
    </button>
  );
}
