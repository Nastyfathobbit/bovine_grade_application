/**
 * Haptic and tactile click feedback utility for mobile and desktop web.
 * Uses navigator.vibrate where available, with a subtle Web Audio API micro-tick
 * fallback so iOS devices also give a crisp tactile "mechanical snap" sensation.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Triggers a crisp haptic notch click.
 * @param intensity 'light' (normal drag snap) or 'medium' (extremity 1 or 10 snap)
 */
export function triggerHapticSnap(intensity: 'light' | 'medium' = 'light'): void {
  // 1. Hardware vibration for Android & supported mobile browsers
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(intensity === 'medium' ? 14 : 8);
    } catch {
      // Ignore vibration errors
    }
  }

  // 2. Subtle mechanical micro-click through Web Audio API
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'running') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freqStart = intensity === 'medium' ? 180 : 140;
      const duration = 0.008; // 8 milliseconds
      const peakGain = intensity === 'medium' ? 0.07 : 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqStart, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + duration);

      gain.gain.setValueAtTime(peakGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.002);
    }
  } catch {
    // Best-effort audio click
  }
}
