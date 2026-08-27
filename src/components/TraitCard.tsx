import React from 'react';
import { TraitDefinition } from '../types';
import { SnappingSlider } from './SnappingSlider';
import { RotateCcw, Check } from 'lucide-react';

interface TraitCardProps {
  trait: TraitDefinition;
  score: number | undefined;
  onScoreChange: (val: number) => void;
  onClearScore: () => void;
  index: number;
}

export const TraitCard: React.FC<TraitCardProps> = ({
  trait,
  score,
  onScoreChange,
  onClearScore,
  index,
}) => {
  const isScored = score !== undefined;

  return (
    <div
      id={`trait-card-${trait.id}`}
      className={`p-4 rounded-xl border transition-all ${
        isScored
          ? 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 shadow-xs'
          : 'bg-stone-50/70 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800'
      }`}
    >
      {/* Header with anatomical site and trait title */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              #{index + 1} {trait.anatomicSite}
            </span>
            {trait.anatomicNotes && (
              <span className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-xs italic">
                ({trait.anatomicNotes})
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1">
            {trait.traitName}
          </h3>
        </div>

        {/* Status / Current Score Pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isScored ? (
            <div className="flex items-center gap-1">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold shadow-xs ${
                  score >= 8
                    ? 'bg-emerald-600 text-white'
                    : score >= 6
                    ? 'bg-teal-600 text-white'
                    : score >= 4
                    ? 'bg-amber-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                Score: {score}
              </span>
              <button
                type="button"
                onClick={onClearScore}
                className="p-1 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                title="Clear score"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
              Unscored
            </span>
          )}
        </div>
      </div>

      {/* Snapping Slider */}
      <SnappingSlider
        value={score}
        onChange={onScoreChange}
        pp3Label={trait.pp3Label}
        pp1Label={trait.pp1Label}
        traitName={trait.traitName}
      />
    </div>
  );
};
