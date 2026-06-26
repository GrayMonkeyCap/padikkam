let audioCtx: AudioContext | null = null;
const ctx = () => {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

function tone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.12) {
  const c = ctx();
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + duration);
}

export function playCorrect() {
  tone(523.25, 0.09);
  setTimeout(() => tone(659.25, 0.09), 70);
  setTimeout(() => tone(783.99, 0.14), 140);
}

export function playWrong() {
  tone(311, 0.22, 'triangle', 0.1);
  setTimeout(() => tone(277, 0.28, 'triangle', 0.08), 130);
}

export function playSwipeRight() {
  tone(587, 0.06, 'sine', 0.07);
  setTimeout(() => tone(784, 0.08, 'sine', 0.06), 50);
}

export function playSwipeLeft() {
  tone(392, 0.1, 'triangle', 0.06);
}

export function playCelebration() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    setTimeout(() => tone(f, 0.12, 'sine', 0.09), i * 75),
  );
}

export function playLevelUp() {
  [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    setTimeout(() => tone(f, 0.1, 'sine', 0.08), i * 60),
  );
}

export function playTap() {
  tone(880, 0.03, 'sine', 0.04);
}
