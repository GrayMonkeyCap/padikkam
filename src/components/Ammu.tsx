type AmmuState = 'idle' | 'greeting' | 'celebrating' | 'encouraging' | 'thinking' | 'sleepy' | 'teaching';

interface Props {
  state?: AmmuState;
  showOrnament?: boolean;
  size?: number;
}

const STATE_MAP = {
  idle:        { eye: 'open',   trunk: 'down', earL: -10, earR: 10,  acc: 'none',     orn: true,  pupil: '30%' },
  greeting:    { eye: 'open',   trunk: 'up',   earL: -18, earR: 8,   acc: 'none',     orn: true,  pupil: '22%' },
  celebrating: { eye: 'happy',  trunk: 'up',   earL: -22, earR: 22,  acc: 'star',     orn: true,  pupil: '30%' },
  encouraging: { eye: 'open',   trunk: 'down', earL: -8,  earR: 8,   acc: 'heart',    orn: true,  pupil: '34%' },
  thinking:    { eye: 'open',   trunk: 'down', earL: -6,  earR: 14,  acc: 'question', orn: true,  pupil: '10%' },
  sleepy:      { eye: 'sleepy', trunk: 'down', earL: 6,   earR: -6,  acc: 'zzz',      orn: false, pupil: '30%' },
  teaching:    { eye: 'open',   trunk: 'down', earL: -10, earR: 10,  acc: 'none',     orn: true,  pupil: '30%', glasses: true },
} as const;

export function Ammu({ state = 'idle', showOrnament, size = 120 }: Props) {
  const c = STATE_MAP[state] ?? STATE_MAP.idle;
  const orn = showOrnament ?? c.orn;

  return (
    <div className="animate-breathe" style={{ position: 'relative', width: size, height: size, fontFamily: "'Baloo 2', sans-serif" }}>
      {/* contact shadow */}
      <div style={{ position: 'absolute', left: '21%', bottom: '3%', width: '58%', height: '8%', borderRadius: '50%', background: 'rgba(60,40,90,.16)', filter: 'blur(6px)' }} />

      {/* EARS */}
      <div style={{ position: 'absolute', left: '1%', top: '26%', width: '34%', height: '42%', borderRadius: '54% 50% 50% 56%', transform: `rotate(${c.earL}deg)`, transformOrigin: '80% 30%', background: 'radial-gradient(120% 120% at 38% 24%,#C7BCFF 0%,#9C8FF0 52%,#6E5FD8 100%)', boxShadow: 'inset 0 -7px 11px rgba(80,60,170,.4),inset 0 5px 8px rgba(255,255,255,.45)' }}>
        <div style={{ position: 'absolute', left: '24%', top: '22%', width: '54%', height: '60%', borderRadius: '50%', background: 'radial-gradient(120% 120% at 40% 30%,#FFD7E4,#FFB0CB)', boxShadow: 'inset 0 -4px 7px rgba(220,120,160,.45)' }} />
      </div>
      <div style={{ position: 'absolute', right: '1%', top: '26%', width: '34%', height: '42%', borderRadius: '50% 54% 56% 50%', transform: `rotate(${c.earR}deg)`, transformOrigin: '20% 30%', background: 'radial-gradient(120% 120% at 38% 24%,#C7BCFF 0%,#9C8FF0 52%,#6E5FD8 100%)', boxShadow: 'inset 0 -7px 11px rgba(80,60,170,.4),inset 0 5px 8px rgba(255,255,255,.45)' }}>
        <div style={{ position: 'absolute', right: '24%', top: '22%', width: '54%', height: '60%', borderRadius: '50%', background: 'radial-gradient(120% 120% at 40% 30%,#FFD7E4,#FFB0CB)', boxShadow: 'inset 0 -4px 7px rgba(220,120,160,.45)' }} />
      </div>

      {/* FEET */}
      <div style={{ position: 'absolute', left: '30%', top: '80%', width: '17%', height: '14%', borderRadius: '42% 42% 46% 46%', background: 'radial-gradient(120% 120% at 40% 26%,#B6A9FB,#7E70E0)', boxShadow: 'inset 0 -5px 8px rgba(80,60,170,.4)' }} />
      <div style={{ position: 'absolute', right: '30%', top: '80%', width: '17%', height: '14%', borderRadius: '42% 42% 46% 46%', background: 'radial-gradient(120% 120% at 40% 26%,#B6A9FB,#7E70E0)', boxShadow: 'inset 0 -5px 8px rgba(80,60,170,.4)' }} />

      {/* BODY */}
      <div style={{ position: 'absolute', left: '18%', top: '22%', width: '64%', height: '64%', borderRadius: '48% 48% 45% 45% / 52% 52% 47% 47%', background: 'radial-gradient(120% 115% at 36% 24%,#CFC5FF 0%,#9C8FF0 50%,#6E5FD8 100%)', boxShadow: '0 16px 26px -14px rgba(90,70,180,.55),inset 0 8px 12px rgba(255,255,255,.5),inset 0 -16px 22px rgba(80,60,170,.45)' }} />

      {/* NETTIPATTAM */}
      {orn && (
        <div style={{ position: 'absolute', left: '37%', top: '19%', width: '26%', height: '13%', borderRadius: '50% 50% 18% 18%', background: 'radial-gradient(120% 130% at 34% 22%,#FFE79A,#FFC23C 55%,#E58A0A)', boxShadow: '0 4px 7px -2px rgba(190,110,0,.5),inset 0 3px 4px rgba(255,255,255,.6),inset 0 -4px 6px rgba(160,90,0,.4)', zIndex: 6 }}>
          <div style={{ position: 'absolute', left: '50%', top: '36%', width: '18%', height: '34%', transform: 'translateX(-50%)', borderRadius: '50%', background: '#C0392B', boxShadow: 'inset 0 -2px 3px rgba(120,20,10,.5)' }} />
        </div>
      )}

      {/* EYES */}
      {c.eye === 'open' && (
        <>
          <div style={{ position: 'absolute', left: '31%', top: '43%', width: '15%', height: '19%', borderRadius: '50%', background: '#fff', boxShadow: 'inset 0 -2px 4px rgba(120,110,160,.25)', zIndex: 5 }}>
            <div style={{ position: 'absolute', left: '26%', top: c.pupil, width: '52%', height: '48%', borderRadius: '50%', background: '#2A2440' }}>
              <div style={{ position: 'absolute', left: '24%', top: '14%', width: '34%', height: '34%', borderRadius: '50%', background: '#fff' }} />
            </div>
          </div>
          <div style={{ position: 'absolute', right: '31%', top: '43%', width: '15%', height: '19%', borderRadius: '50%', background: '#fff', boxShadow: 'inset 0 -2px 4px rgba(120,110,160,.25)', zIndex: 5 }}>
            <div style={{ position: 'absolute', left: '22%', top: c.pupil, width: '52%', height: '48%', borderRadius: '50%', background: '#2A2440' }}>
              <div style={{ position: 'absolute', left: '24%', top: '14%', width: '34%', height: '34%', borderRadius: '50%', background: '#fff' }} />
            </div>
          </div>
        </>
      )}
      {c.eye === 'happy' && (
        <>
          <div style={{ position: 'absolute', left: '32%', top: '46%', width: '13%', height: '11%', borderTop: '3.5px solid #2A2440', borderRadius: '50% 50% 0 0', zIndex: 5 }} />
          <div style={{ position: 'absolute', right: '32%', top: '46%', width: '13%', height: '11%', borderTop: '3.5px solid #2A2440', borderRadius: '50% 50% 0 0', zIndex: 5 }} />
        </>
      )}
      {c.eye === 'sleepy' && (
        <>
          <div style={{ position: 'absolute', left: '32%', top: '50%', width: '13%', height: '9%', borderTop: '3.5px solid #2A2440', borderRadius: '0 0 50% 50%', zIndex: 5 }} />
          <div style={{ position: 'absolute', right: '32%', top: '50%', width: '13%', height: '9%', borderTop: '3.5px solid #2A2440', borderRadius: '0 0 50% 50%', zIndex: 5 }} />
        </>
      )}

      {/* GLASSES */}
      {'glasses' in c && c.glasses && (
        <>
          <div style={{ position: 'absolute', left: '29%', top: '42%', width: '42%', height: '1.6%', background: '#3A2E1A', zIndex: 6, borderRadius: 2 }} />
          <div style={{ position: 'absolute', left: '29%', top: '41%', width: '19%', height: '22%', border: '3px solid #3A2E1A', borderRadius: '50%', zIndex: 6 }} />
          <div style={{ position: 'absolute', right: '29%', top: '41%', width: '19%', height: '22%', border: '3px solid #3A2E1A', borderRadius: '50%', zIndex: 6 }} />
        </>
      )}

      {/* CHEEKS */}
      <div style={{ position: 'absolute', left: '25%', top: '60%', width: '13%', height: '9%', borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,120,160,.55),rgba(255,120,160,0) 70%)', zIndex: 4 }} />
      <div style={{ position: 'absolute', right: '25%', top: '60%', width: '13%', height: '9%', borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,120,160,.55),rgba(255,120,160,0) 70%)', zIndex: 4 }} />

      {/* TUSKS */}
      <div style={{ position: 'absolute', left: '41%', top: '69%', width: '5%', height: '8%', borderRadius: '40% 40% 50% 50%', background: 'linear-gradient(#fff,#F2ECDA)', zIndex: 5, boxShadow: '0 1px 2px rgba(0,0,0,.15)' }} />
      <div style={{ position: 'absolute', right: '41%', top: '69%', width: '5%', height: '8%', borderRadius: '40% 40% 50% 50%', background: 'linear-gradient(#fff,#F2ECDA)', zIndex: 5, boxShadow: '0 1px 2px rgba(0,0,0,.15)' }} />

      {/* TRUNK */}
      {c.trunk === 'down' && (
        <div style={{ position: 'absolute', left: '44.5%', top: '60%', width: '11%', height: '26%', borderRadius: '45% 45% 60% 40% / 30% 30% 60% 60%', transform: 'rotate(8deg)', transformOrigin: 'top center', background: 'radial-gradient(120% 120% at 36% 24%,#CFC5FF,#8E80EC 55%,#6E5FD8)', boxShadow: 'inset 0 -6px 9px rgba(80,60,170,.4),inset 0 4px 6px rgba(255,255,255,.4)', zIndex: 5 }}>
          <div style={{ position: 'absolute', left: '-2%', bottom: '-6%', width: '60%', height: '34%', borderRadius: '50%', background: 'radial-gradient(120% 120% at 36% 24%,#CFC5FF,#7E70E0)', transform: 'rotate(20deg)' }} />
        </div>
      )}
      {c.trunk === 'up' && (
        <div style={{ position: 'absolute', left: '46%', top: '42%', width: '10%', height: '30%', borderRadius: '60% 40% 45% 45% / 60% 60% 30% 30%', transform: 'rotate(-24deg)', transformOrigin: 'bottom center', background: 'radial-gradient(120% 120% at 36% 24%,#CFC5FF,#8E80EC 55%,#6E5FD8)', boxShadow: 'inset 0 6px 9px rgba(80,60,170,.4),inset 0 -4px 6px rgba(255,255,255,.4)', zIndex: 5 }}>
          <div style={{ position: 'absolute', right: '-6%', top: '-4%', width: '54%', height: '32%', borderRadius: '50%', background: 'radial-gradient(120% 120% at 36% 24%,#CFC5FF,#7E70E0)', transform: 'rotate(-26deg)' }} />
        </div>
      )}

      {/* OVERLAYS */}
      {c.acc === 'zzz' && (
        <div style={{ position: 'absolute', right: '6%', top: '10%', zIndex: 8, color: '#9C8FF0', fontWeight: 800 }}>
          <span style={{ fontSize: 0.15 * size, position: 'absolute', right: 0.28 * size, top: 0.15 * size }}>z</span>
          <span style={{ fontSize: 0.22 * size, position: 'absolute', right: 0.12 * size, top: 0.02 * size }}>Z</span>
          <span style={{ fontSize: 0.3 * size, position: 'absolute', right: -0.12 * size, top: -0.15 * size }}>Z</span>
        </div>
      )}
      {c.acc === 'heart' && (
        <div style={{ position: 'absolute', right: '8%', top: '8%', width: '15%', height: '15%', zIndex: 8, transform: 'rotate(-12deg)' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: '60%', height: '60%', background: '#FF5C72', borderRadius: '50% 50% 0 50%', transform: 'rotate(45deg)', boxShadow: 'inset 0 -3px 5px rgba(150,20,40,.35)' }} />
        </div>
      )}
      {c.acc === 'star' && (
        <div style={{ position: 'absolute', right: '5%', top: '6%', width: '16%', height: '16%', background: 'radial-gradient(120% 120% at 34% 26%,#FFE08A,#FFB627 55%,#E5870A)', clipPath: 'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)', zIndex: 8, filter: 'drop-shadow(0 3px 4px rgba(190,110,0,.4))' }} />
      )}
      {c.acc === 'question' && (
        <>
          <div style={{ position: 'absolute', right: '8%', top: '4%', fontSize: 0.28 * size, fontWeight: 800, color: '#0FBFA8', zIndex: 8, textShadow: '0 3px 5px rgba(15,191,168,.35)' }}>?</div>
          <div style={{ position: 'absolute', right: '30%', top: '16%', width: 6, height: 6, borderRadius: '50%', background: '#9C8FF0', zIndex: 8 }} />
          <div style={{ position: 'absolute', right: '24%', top: '11%', width: 9, height: 9, borderRadius: '50%', background: '#9C8FF0', zIndex: 8 }} />
        </>
      )}
    </div>
  );
}
