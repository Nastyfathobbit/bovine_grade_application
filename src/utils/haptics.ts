/**
 * Cross-platform haptic feedback utility for mobile and desktop web.
 *
 * - Android / Chrome: Uses the standard Vibration API (`navigator.vibrate`).
 * - iPhone / iOS Safari (17.4+ / 18+): Uses a pre-mounted hidden native
 *   `<input type="checkbox" switch>` paired with a `<label>` element.
 *   Triggering `label.click()` during user interaction invokes Safari's
 *   native Taptic Engine hardware haptic pulse.
 * - Fallback: Subtle Web Audio micro-tick only on browsers lacking both
 *   `navigator.vibrate` and iOS `switch` haptics.
 */

let audioCtx: AudioContext | null = null;
let iosHapticLabel: HTMLLabelElement | null = null;
let lastHapticTimestamp = 0;

function supportsNativeVibration(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

function supportsIosSwitchHaptic(): boolean {
  if (typeof document === 'undefined' || typeof HTMLInputElement === 'undefined') {
    return false;
  }
  return 'switch' in HTMLInputElement.prototype;
}

function ensureIosHapticElements(): HTMLLabelElement | null {
  if (typeof document === 'undefined' || !document.body) return null;

  if (iosHapticLabel && document.body.contains(iosHapticLabel)) {
    return iosHapticLabel;
  }

  const existing = document.getElementById('bovine-ios-haptic-label');
  if (existing instanceof HTMLLabelElement) {
    iosHapticLabel = existing;
    return iosHapticLabel;
  }

  // Keep a 1x1 visually invisible, non-interactive fixed container in the render tree
  // so WebKit renders the native switch control without causing layout shift or scroll jumps.
  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '1px';
  container.style.height = '1px';
  container.style.opacity = '0';
  container.style.overflow = 'hidden';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '-1';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = 'bovine-ios-haptic-switch';
  input.tabIndex = -1;
  input.setAttribute('switch', '');
  input.setAttribute('aria-hidden', 'true');
  input.style.margin = '0';
  input.style.pointerEvents = 'none';

  const label = document.createElement('label');
  label.id = 'bovine-ios-haptic-label';
  label.htmlFor = input.id;
  label.setAttribute('aria-hidden', 'true');
  label.style.pointerEvents = 'none';

  container.appendChild(input);
  container.appendChild(label);
  document.body.appendChild(container);

  iosHapticLabel = label;
  return iosHapticLabel;
}

/**
 * Pre-mounts the hidden iOS switch element so WebKit completes layout
 * before the user's first tap or slide.
 */
export function initHaptics(): void {
  if (!supportsNativeVibration() && supportsIosSwitchHaptic()) {
    ensureIosHapticElements();
  }
}

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
    return audioCtx;
  } catch {
    return null;
  }
}

function playMicroClick(intensity: 'light' | 'medium'): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const triggerOsc = () => {
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freqStart = intensity === 'medium' ? 180 : 140;
      const duration = 0.008;
      const peakGain = intensity === 'medium' ? 0.06 : 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqStart, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + duration);

      gain.gain.setValueAtTime(peakGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.002);
    } catch {
      // Ignore audio errors
    }
  };

  if (ctx.state === 'suspended') {
    ctx.resume().then(triggerOsc).catch(() => {});
  } else if (ctx.state === 'running') {
    triggerOsc();
  }
}

/**
 * Triggers a crisp haptic notch click.
 * @param intensity 'light' (normal drag snap) or 'medium' (extremity 1 or 10 snap)
 */
export function triggerHapticSnap(intensity: 'light' | 'medium' = 'light'): void {
  // Prevent duplicate triggers within 12ms
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (now - lastHapticTimestamp < 12) return;
  lastHapticTimestamp = now;

  // 1. Standard Vibration API (Android / supported mobile browsers)
  if (supportsNativeVibration()) {
    try {
      navigator.vibrate(intensity === 'medium' ? 14 : 8);
      return;
    } catch {
      // Fall through
    }
  }

  // 2. iOS Safari 17.4+ / 18+ native <input switch> Taptic Engine haptic
  if (supportsIosSwitchHaptic()) {
    try {
      const label = ensureIosHapticElements();
      if (label) {
        label.click();
        return;
      }
    } catch {
      // Fall through
    }
  }

  // 3. Fallback micro-click for browsers without hardware haptics
  playMicroClick(intensity);
}
