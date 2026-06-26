import { useAudio } from '../audio/useAudio';

interface Props {
  clipId: string;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const dims = {
  sm: { cls: 'h-9 w-9', icon: 14 },
  md: { cls: 'h-12 w-12', icon: 18 },
  lg: { cls: 'h-16 w-16', icon: 24 },
} as const;

function PlayIcon({ size, playing }: { size: number; playing: boolean }) {
  if (playing) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="4" width="5" height="16" rx="1.5" />
        <rect x="15" y="4" width="5" height="16" rx="1.5" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4.5v15l13-7.5L6 4.5z" />
    </svg>
  );
}

export function AudioButton({ clipId, fallbackText, size = 'md', label }: Props) {
  const { play, playingId } = useAudio();
  const isPlaying = playingId === clipId;
  const d = dims[size];

  return (
    <button
      type="button"
      aria-label={label ?? 'Play pronunciation'}
      onClick={() => play(clipId, { fallbackText, lang: 'ml-IN' })}
      className={`${d.cls} inline-flex shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_0_var(--color-primary-deep)] transition active:translate-y-[2px] active:shadow-none hover:brightness-105 ${
        isPlaying ? 'animate-pop ring-4 ring-primary-soft' : ''
      }`}
    >
      <PlayIcon size={d.icon} playing={isPlaying} />
    </button>
  );
}
