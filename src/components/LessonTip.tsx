import { useState } from 'react';
import type { Tip } from '../content/types';
import { Card } from './Card';
import { Ammu } from './Ammu';

export function LessonTip({ tip }: { tip: Tip }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="border-grape/30 bg-grape-soft">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <Ammu state="teaching" size={40} />
          <span className="font-display font-bold text-ink">{tip.title}</span>
        </div>
        <span className="text-ink-faint">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          {tip.intro && <p className="text-sm text-ink-muted">{tip.intro}</p>}
          {tip.points.map((point, i) => (
            <div key={i}>
              <h4 className="text-sm font-bold text-grape-deep">{point.heading}</h4>
              <p className="mt-0.5 text-sm text-ink-muted">{point.body}</p>
              {point.examples?.map((ex, j) => (
                <div key={j} className="mt-2 rounded-2xl bg-surface-card/80 px-3 py-2">
                  <div className="font-display font-semibold text-ink">{ex.roman}</div>
                  <div className="text-sm text-ink-muted" lang="hi">
                    {ex.deva}
                  </div>
                  <div className="text-sm text-ink/60">{ex.english}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
