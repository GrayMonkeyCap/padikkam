import { useState } from 'react';
import type { Tip } from '../content/types';
import { Card } from './Card';

/** Collapsible grammar/usage tip shown at the top of a lesson — the "guidebook". */
export function LessonTip({ tip }: { tip: Tip }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="border-gold-400/40 bg-gold-300/10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <span className="font-bold text-teal-900">{tip.title}</span>
        </div>
        <span className="text-ink/40">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          {tip.intro && <p className="text-sm text-ink/70">{tip.intro}</p>}
          {tip.points.map((point, i) => (
            <div key={i}>
              <h4 className="text-sm font-bold text-teal-800">{point.heading}</h4>
              <p className="mt-0.5 text-sm text-ink/70">{point.body}</p>
              {point.examples?.map((ex, j) => (
                <div key={j} className="mt-2 rounded-xl bg-white/70 px-3 py-2">
                  <div className="font-semibold text-teal-900">{ex.roman}</div>
                  <div className="text-sm text-teal-700/70" lang="hi">
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
