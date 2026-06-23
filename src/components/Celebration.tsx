import { useEffect, useState } from 'react';

const EMOJIS = ['🎉', '✨', '🌟', '🥳', '💚', '🎊'];

/** Lightweight CSS confetti burst — no dependency. Renders when `show` flips true. */
export function Celebration({ show }: { show: boolean }) {
  const [pieces, setPieces] = useState<{ id: number; left: number; emoji: string; delay: number }[]>([]);

  useEffect(() => {
    if (!show) return;
    setPieces(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        emoji: EMOJIS[i % EMOJIS.length],
        delay: Math.random() * 0.3,
      })),
    );
    const t = setTimeout(() => setPieces([]), 1500);
    return () => clearTimeout(t);
  }, [show]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 text-2xl"
          style={{
            left: `${p.left}%`,
            animation: `fall 1.2s ease-in ${p.delay}s forwards`,
          }}
        >
          {p.emoji}
        </span>
      ))}
      <style>{`@keyframes fall { 0% { transform: translateY(-10vh) rotate(0); opacity: 1; } 100% { transform: translateY(110vh) rotate(360deg); opacity: 0; } }`}</style>
    </div>
  );
}
