import { useEffect, useState } from 'react';

const COLORS = ['#0FBFA8', '#FFB627', '#FF5C72', '#34C759', '#6E5FD8', '#FF9F1C'];
const SHAPES = ['square', 'circle'] as const;

interface Piece {
  id: number;
  left: number;
  color: string;
  shape: typeof SHAPES[number];
  delay: number;
  size: number;
}

export function Celebration({ show }: { show: boolean }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!show) return;
    setPieces(
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: COLORS[i % COLORS.length],
        shape: SHAPES[i % SHAPES.length],
        delay: Math.random() * 0.4,
        size: 8 + Math.random() * 10,
      })),
    );
    const t = setTimeout(() => setPieces([]), 1800);
    return () => clearTimeout(t);
  }, [show]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '3px',
            animation: `fall 1.4s ease-in ${p.delay}s forwards`,
            boxShadow: `inset 0 -2px 3px rgba(0,0,0,.15)`,
          }}
        />
      ))}
    </div>
  );
}
