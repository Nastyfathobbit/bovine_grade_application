import React, { useId } from 'react';
import { motion } from 'motion/react';

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
}) => {
  const inputId = useId();
  const currentValue = value ?? 5; // Default display anchor if unset

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(e.target.value, 10);
    if (!isNaN(newVal)) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(8);
        } catch {
          // Ignore
        }
      }
      onChange(newVal);
    }
  };

  const handleStepClick = (step: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch {
        // Ignore
      }
    }
    onChange(step);
  };

  // Compute solid color based on score (No green at low scores like 3)
  const getScoreColorHex = (score: number) => {
    if (score >= 8) return '#059669'; // Emerald
    if (score >= 6) return '#0d9488'; // Teal
    if (score >= 4) return '#d97706'; // Amber
    return '#e11d48'; // Rose/Red (1-3)
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 8) return 'bg-emerald-600 text-white';
    if (score >= 6) return 'bg-teal-600 text-white';
    if (score >= 4) return 'bg-amber-600 text-white';
    return 'bg-rose-600 text-white';
  };

  const isScored = value !== undefined;

  return (
    <div className="w-full select-none">
      {/* Category Labels Banner (Without "extremity" text) */}
      <div className="grid grid-cols-2 gap-2 mb-2.5">
        {/* Left - Score 1 (PP3) */}
        <button
          type="button"
          onClick={() => handleStepClick(1)}
          className={`flex items-start gap-1.5 p-2 rounded-lg text-left transition-all border ${
            value === 1
              ? 'bg-rose-50 border-rose-400 dark:bg-rose-950/40 dark:border-rose-700 shadow-xs'
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

        {/* Right - Score 10 (PP1) */}
        <button
          type="button"
          onClick={() => handleStepClick(10)}
          className={`flex items-start justify-end gap-1.5 p-2 rounded-lg text-right transition-all border ${
            value === 10
              ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-700 shadow-xs'
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

      {/* Main Snapping Slider Track Area - aligned with button columns (5% to 95%) */}
      <div className="relative pt-1 pb-2 px-[5%] touch-slider-control">
        <div className="relative touch-slider-control">
          {/* Visual Track bar */}
          <div className="relative h-3.5 w-full rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden shadow-inner touch-none">
            {isScored && (
              <div
                className="absolute left-0 top-0 bottom-0 transition-all duration-150 rounded-full pointer-events-none"
                style={{
                  width: `${((currentValue - 1) / 9) * 100}%`,
                  backgroundColor: getScoreColorHex(currentValue),
                }}
              />
            )}
          </div>

          {/* Hidden Range Input overlay matching exact track width */}
          <input
            id={inputId}
            type="range"
            min="1"
            max="10"
            step="1"
            value={currentValue}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 touch-slider-control touch-none"
            style={{ touchAction: 'none' }}
            aria-label={`Score from 1 (${pp3Label}) to 10 (${pp1Label})`}
          />

          {/* Active Thumb Pin Indicator */}
          {isScored && (
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"
              style={{
                left: `${((currentValue - 1) / 9) * 100}%`,
              }}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 border-white dark:border-stone-900 shadow-md flex items-center justify-center text-xs font-bold ${getScoreBadgeClass(
                  currentValue
                )}`}
              >
                {currentValue}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 1-10 Discrete Quick-Tap Buttons */}
      <div className="grid grid-cols-10 gap-1 mt-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((step) => {
          const isSelected = value === step;
          let stepBg = 'bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-300';
          if (isSelected) {
            if (step >= 8) stepBg = 'bg-emerald-600 text-white font-bold shadow-xs scale-105';
            else if (step >= 6) stepBg = 'bg-teal-600 text-white font-bold shadow-xs scale-105';
            else if (step >= 4) stepBg = 'bg-amber-600 text-white font-bold shadow-xs scale-105';
            else stepBg = 'bg-rose-600 text-white font-bold shadow-xs scale-105';
          }

          return (
            <button
              key={step}
              type="button"
              onClick={() => handleStepClick(step)}
              className={`h-8 sm:h-9 rounded-md flex flex-col items-center justify-center text-xs transition-transform active:scale-95 ${stepBg}`}
              title={`Score ${step}`}
            >
              <span className="font-semibold">{step}</span>
              {step === 1 && <span className="text-[8px] opacity-70 leading-none">PP3</span>}
              {step === 10 && <span className="text-[8px] opacity-70 leading-none">PP1</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
