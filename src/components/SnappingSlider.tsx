import React, { useRef, useCallback } from 'react';
import { triggerHapticSnap } from '../utils/haptics';

interface SnappingSliderProps {
  value: number | undefined; // 1 to 10 or undefined
  onChange: (val: number) => void;
  pp3Label: string; // Left (1)
  pp1Label: string; // Right (10)
  traitName?: string;
  categoryColor?: string;
}

export const SnappingSlider: React.FC<SnappingSliderProps> = ({
  value,
  onChange,
  pp3Label,
  pp1Label,
  traitName,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastStepRef = useRef<number | undefined>(value);

  // Keep lastStepRef synchronized with props
  lastStepRef.current = value;

  // Calculates which step (1 to 10) corresponds to a given horizontal pointer position
  const getStepFromPointer = useCallback((clientX: number): number => {
    if (!barRef.current) return 5;
    const rect = barRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, relativeX / rect.width));
    // 10 distinct segments: 0..0.1 -> 1, 0.1..0.2 -> 2, ..., 0.9..1.0 -> 10
    const step = Math.min(10, Math.max(1, Math.floor(fraction * 10) + 1));
    return step;
  }, []);

  const selectStep = useCallback(
    (step: number, notifyHaptic = true) => {
      if (step < 1 || step > 10) return;
      if (notifyHaptic && step !== lastStepRef.current) {
        triggerHapticSnap(step === 1 || step === 10 ? 'medium' : 'light');
      }
      lastStepRef.current = step;
      onChange(step);
    },
    [onChange]
  );

  // Pointer event handlers for smooth sliding across buttons
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only respond to primary touch/mouse button
    if (e.button !== 0) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Best-effort pointer capture
    }

    isDraggingRef.current = true;
    const step = getStepFromPointer(e.clientX);
    selectStep(step, true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const step = getStepFromPointer(e.clientX);
    if (step !== lastStepRef.current) {
      selectStep(step, true);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
  };

  // Keyboard accessibility handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const current = value ?? 5;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(10, current + 1);
      selectStep(next, true);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(1, current - 1);
      selectStep(prev, true);
    } else if (e.key === 'Home') {
      e.preventDefault();
      selectStep(1, true);
    } else if (e.key === 'End') {
      e.preventDefault();
      selectStep(10, true);
    } else if (e.key >= '1' && e.key <= '9') {
      selectStep(parseInt(e.key, 10), true);
    } else if (e.key === '0') {
      selectStep(10, true);
    }
  };

  const isScored = value !== undefined;

  const getScoreBadgeColor = (val: number) => {
    if (val >= 8) return 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300 dark:ring-emerald-800';
    if (val >= 6) return 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-300 dark:ring-teal-800';
    if (val >= 4) return 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300 dark:ring-amber-800';
    return 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300 dark:ring-rose-800';
  };

  const getScoreSummaryLabel = (val: number) => {
    if (val >= 8) return 'PP1 (Upper Tier)';
    if (val >= 6) return 'PP2+ (Above Neutral)';
    if (val >= 4) return 'PP2- (Below Neutral)';
    return 'PP3 (Lower Extremity)';
  };

  return (
    <div className="w-full select-none">
      {/* Category Labels Banner (Extremity Reference Buttons) */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {/* Left - Score 1 (PP3 Extremity) */}
        <button
          type="button"
          onClick={() => selectStep(1, true)}
          className={`flex items-start gap-1.5 p-2 rounded-lg text-left transition-all border ${
            value === 1
              ? 'bg-rose-50 border-rose-400 dark:bg-rose-950/40 dark:border-rose-700 shadow-xs ring-1 ring-rose-300 dark:ring-rose-800'
              : 'bg-stone-50 hover:bg-stone-100 border-stone-200 dark:bg-stone-900/60 dark:border-stone-800'
          }`}
        >
          <span className="inline-flex items-center justify-center shrink-0 w-5 h-5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/70 dark:text-rose-200">
            1
          </span>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              PP3
            </span>
            <span className="block text-xs font-medium text-stone-800 dark:text-stone-200 leading-snug line-clamp-2">
              {pp3Label}
            </span>
          </div>
        </button>

        {/* Right - Score 10 (PP1 Extremity) */}
        <button
          type="button"
          onClick={() => selectStep(10, true)}
          className={`flex items-start justify-end gap-1.5 p-2 rounded-lg text-right transition-all border ${
            value === 10
              ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-700 shadow-xs ring-1 ring-emerald-300 dark:ring-emerald-800'
              : 'bg-stone-50 hover:bg-stone-100 border-stone-200 dark:bg-stone-900/60 dark:border-stone-800'
          }`}
        >
          <div className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              PP1
            </span>
            <span className="block text-xs font-medium text-stone-800 dark:text-stone-200 leading-snug line-clamp-2">
              {pp1Label}
            </span>
          </div>
          <span className="inline-flex items-center justify-center shrink-0 w-5 h-5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200">
            10
          </span>
        </button>
      </div>

      {/* Slidable 1-10 Buttons Bar (Tap or Slide across to Snap) */}
      <div
        ref={barRef}
        role="slider"
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={value ?? 5}
        aria-label={traitName ? `${traitName} score` : 'Trait score (1 to 10)'}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative grid grid-cols-10 gap-1 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700/60 touch-none select-none cursor-ew-resize focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        style={{ touchAction: 'none' }}
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((step) => {
          const isSelected = value === step;

          return (
            <div
              key={step}
              data-step={step}
              className={`h-11 sm:h-12 rounded-lg flex flex-col items-center justify-center transition-all duration-100 relative ${
                isSelected
                  ? `${getScoreBadgeColor(step)} z-10 scale-[1.05]`
                  : 'bg-white dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 border border-stone-200/70 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <span className={`text-sm sm:text-base leading-none ${isSelected ? 'font-black' : 'font-semibold'}`}>
                {step}
              </span>
              {step === 1 && (
                <span className={`text-[8px] mt-0.5 leading-none ${isSelected ? 'text-white/90 font-bold' : 'text-stone-400'}`}>
                  PP3
                </span>
              )}
              {step === 10 && (
                <span className={`text-[8px] mt-0.5 leading-none ${isSelected ? 'text-white/90 font-bold' : 'text-stone-400'}`}>
                  PP1
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Dynamic Status & Guidance Footer */}
      <div className="flex items-center justify-between text-[11px] px-1 mt-1.5 text-stone-500 dark:text-stone-400">
        <span className="flex items-center gap-1">
          <span className="text-[10px] uppercase font-bold text-stone-400">Slide or tap 1-10</span>
        </span>
        {isScored && (
          <span className="font-semibold text-stone-700 dark:text-stone-300">
            Selected: <span className="font-bold">{value}</span> ({getScoreSummaryLabel(value)})
          </span>
        )}
      </div>
    </div>
  );
};
