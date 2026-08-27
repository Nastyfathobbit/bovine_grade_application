import React, { useState, useMemo, useEffect } from 'react';
import { CowRecord, DynamicFieldDefinition, TraitCategoryId, ProductionProfileCategory } from '../types';
import { TRAIT_DEFINITIONS, CATEGORIES_CONFIG } from '../data/traitDefinitions';
import { TraitCard } from './TraitCard';
import { DynamicFieldEditorModal } from './DynamicFieldEditorModal';
import confetti from 'canvas-confetti';
import {
  Save,
  RotateCcw,
  Settings2,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Info,
  Tag,
  CheckCircle,
  Award,
} from 'lucide-react';

interface AssessmentFormProps {
  initialRecord?: CowRecord | null;
  dynamicFields: DynamicFieldDefinition[];
  onSaveRecord: (record: CowRecord, shouldNext: boolean) => void;
  onUpdateDynamicFields: (fields: DynamicFieldDefinition[]) => void;
  onOpenReferenceGuide: () => void;
}

const PRODUCTION_PROFILES: {
  id: ProductionProfileCategory;
  label: string;
  sublabel: string;
  badgeColor: string;
  selectedClass: string;
}[] = [
  {
    id: 'PP3',
    label: 'PP3',
    sublabel: 'Low Profile Extremity',
    badgeColor: 'border-rose-300 text-rose-700 dark:border-rose-800 dark:text-rose-300',
    selectedClass: 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300 dark:ring-rose-900',
  },
  {
    id: 'PP2-',
    label: 'PP2-',
    sublabel: 'Moderate Low',
    badgeColor: 'border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300',
    selectedClass: 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300 dark:ring-amber-900',
  },
  {
    id: 'PP2+',
    label: 'PP2+',
    sublabel: 'Moderate High',
    badgeColor: 'border-teal-300 text-teal-700 dark:border-teal-800 dark:text-teal-300',
    selectedClass: 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-300 dark:ring-teal-900',
  },
  {
    id: 'PP1',
    label: 'PP1',
    sublabel: 'High Profile Extremity',
    badgeColor: 'border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300',
    selectedClass: 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300 dark:ring-emerald-900',
  },
];

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  initialRecord,
  dynamicFields,
  onSaveRecord,
  onUpdateDynamicFields,
  onOpenReferenceGuide,
}) => {
  const [cowId, setCowId] = useState(initialRecord?.cowId || '');
  const [assessorName, setAssessorName] = useState(
    initialRecord?.assessorName || 'Dr. Production Vet'
  );
  const [notes, setNotes] = useState(initialRecord?.notes || '');
  const [traitScores, setTraitScores] = useState<Record<string, number>>(
    initialRecord?.traitScores || {}
  );
  const [dynamicValues, setDynamicValues] = useState<Record<string, string | number>>(
    initialRecord?.dynamicValues || {
      classification_date: new Date().toISOString().split('T')[0],
    }
  );
  const [finalProductionCategory, setFinalProductionCategory] = useState<ProductionProfileCategory | undefined>(
    initialRecord?.finalProductionCategory
  );

  const [activeCategory, setActiveCategory] = useState<TraitCategoryId | 'all'>('all');
  const [isFieldEditorOpen, setIsFieldEditorOpen] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Sync if initialRecord changes (e.g. edit mode)
  useEffect(() => {
    if (initialRecord) {
      setCowId(initialRecord.cowId);
      setAssessorName(initialRecord.assessorName || '');
      setNotes(initialRecord.notes || '');
      setTraitScores(initialRecord.traitScores || {});
      setDynamicValues(initialRecord.dynamicValues || {});
      setFinalProductionCategory(initialRecord.finalProductionCategory);
    }
  }, [initialRecord]);

  // Scoring statistics (Counts only, NO averages)
  const totalTraitsCount = TRAIT_DEFINITIONS.length;
  const scoredCount = useMemo(() => {
    return Object.keys(traitScores).filter((k) => traitScores[k] !== undefined).length;
  }, [traitScores]);

  const completionPercent = Math.round((scoredCount / totalTraitsCount) * 100);

  // Category statistics (Counts only)
  const categoryStats = useMemo(() => {
    return CATEGORIES_CONFIG.map((cat) => {
      const catTraits = TRAIT_DEFINITIONS.filter((t) => t.categoryId === cat.id);
      const catScored = catTraits.filter((t) => traitScores[t.id] !== undefined);

      return {
        id: cat.id,
        name: cat.name,
        shortName: cat.shortName,
        total: catTraits.length,
        scored: catScored.length,
      };
    });
  }, [traitScores]);

  // Handlers
  const handleScoreChange = (traitId: string, score: number) => {
    setTraitScores((prev) => ({ ...prev, [traitId]: score }));
    setErrorBanner(null);
  };

  const handleClearScore = (traitId: string) => {
    setTraitScores((prev) => {
      const next = { ...prev };
      delete next[traitId];
      return next;
    });
  };

  const handleSetAllNeutral = () => {
    const updated = { ...traitScores };
    TRAIT_DEFINITIONS.forEach((t) => {
      if (updated[t.id] === undefined) {
        updated[t.id] = 5;
      }
    });
    setTraitScores(updated);
  };

  const handleClearAllScores = () => {
    if (window.confirm('Reset all scored traits for this cow?')) {
      setTraitScores({});
    }
  };

  const handleDynamicValueChange = (fieldId: string, val: string | number) => {
    setDynamicValues((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleSave = (shouldNext: boolean) => {
    const trimmedId = cowId.trim();
    if (!trimmedId) {
      setErrorBanner('Please enter a Cow ID before saving.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const record: CowRecord = {
      id: initialRecord?.id || `cow_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      cowId: trimmedId,
      timestamp: initialRecord?.timestamp || Date.now(),
      assessorName: assessorName.trim() || undefined,
      notes: notes.trim() || undefined,
      traitScores,
      dynamicValues,
      finalProductionCategory,
    };

    // Confetti effect if fully scored
    if (completionPercent >= 80) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {
        // Ignore
      }
    }

    onSaveRecord(record, shouldNext);

    if (shouldNext) {
      // Auto increment Cow ID if ending in digits (e.g., COW-101 -> COW-102)
      let nextCowId = '';
      const match = trimmedId.match(/^(.*?)(\d+)$/);
      if (match) {
        const prefix = match[1];
        const num = parseInt(match[2], 10) + 1;
        const padded = String(num).padStart(match[2].length, '0');
        nextCowId = `${prefix}${padded}`;
      }

      setCowId(nextCowId);
      setTraitScores({});
      setFinalProductionCategory(undefined);
      setNotes('');
      setErrorBanner(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredTraits = useMemo(() => {
    if (activeCategory === 'all') {
      return TRAIT_DEFINITIONS;
    }
    return TRAIT_DEFINITIONS.filter((t) => t.categoryId === activeCategory);
  }, [activeCategory]);

  const activeDynamicFields = dynamicFields.filter((f) => f.enabled);

  return (
    <div className="space-y-4 pb-28">
      {/* Error Alert */}
      {errorBanner && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-200 rounded-xl text-sm font-semibold flex items-center justify-between">
          <span>{errorBanner}</span>
          <button
            type="button"
            onClick={() => setErrorBanner(null)}
            className="text-rose-600 dark:text-rose-400 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Cow Identification Header */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Cow ID Input */}
          <div className="flex-1">
            <label
              htmlFor="cow-id-input"
              className="block text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5" />
              Cow Identifier (Required)
            </label>
            <div className="relative">
              <input
                id="cow-id-input"
                type="text"
                value={cowId}
                onChange={(e) => {
                  setCowId(e.target.value);
                  if (errorBanner) setErrorBanner(null);
                }}
                placeholder="e.g. COW-104, B-8802, Ear Tag #..."
                className="w-full text-lg sm:text-xl font-bold px-3.5 py-2.5 rounded-xl border-2 border-stone-300 focus:border-emerald-600 dark:border-stone-700 dark:focus:border-emerald-500 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
              />
              {cowId && (
                <button
                  type="button"
                  onClick={() => setCowId('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs px-1.5 py-0.5 rounded-md bg-stone-200 dark:bg-stone-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Progress Badge */}
          <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-800/80 p-3 rounded-xl border border-stone-200 dark:border-stone-700/70 shrink-0">
            <div className="text-right">
              <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                Traits Scored
              </div>
              <div className="text-lg font-bold text-stone-900 dark:text-stone-100">
                <span className="text-emerald-600 dark:text-emerald-400">{scoredCount}</span>
                <span className="text-stone-400 font-normal">/{totalTraitsCount}</span>
              </div>
            </div>

            {/* Circular progress badge */}
            <div className="w-12 h-12 rounded-full border-4 border-stone-200 dark:border-stone-700 flex items-center justify-center relative">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                {completionPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Metadata Accordion / Strip */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                Animal Record Information ({activeDynamicFields.length} fields)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsFieldEditorOpen(true)}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Configure Fields
            </button>
          </div>

          {/* Dynamic Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {activeDynamicFields.map((field) => (
              <div key={field.id} className="bg-stone-50 dark:bg-stone-800/40 p-2 rounded-xl border border-stone-200 dark:border-stone-800">
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5 truncate">
                  {field.label} {field.unit ? `(${field.unit})` : ''}
                </label>
                <input
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  value={dynamicValues[field.id] ?? ''}
                  onChange={(e) =>
                    handleDynamicValueChange(
                      field.id,
                      field.type === 'number' ? parseFloat(e.target.value) || '' : e.target.value
                    )
                  }
                  placeholder={field.placeholder || 'Enter value...'}
                  className="w-full text-xs font-medium px-2 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Navigation Pills & Quick Batch Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
              activeCategory === 'all'
                ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100'
            }`}
          >
            All Traits ({totalTraitsCount})
          </button>

          {categoryStats.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100'
              }`}
            >
              <span>{cat.shortName}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  activeCategory === cat.id
                    ? 'bg-emerald-800/80 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                {cat.scored}/{cat.total}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleSetAllNeutral}
            className="text-xs px-2.5 py-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-100 flex items-center gap-1"
            title="Fill unscored traits with neutral 5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Fill Unscored (5)
          </button>
          <button
            type="button"
            onClick={handleClearAllScores}
            className="text-xs px-2 py-1 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-500 hover:text-stone-800 hover:bg-stone-100 flex items-center gap-1"
            title="Clear all scores"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          <button
            type="button"
            onClick={onOpenReferenceGuide}
            className="text-xs px-2 py-1 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 hover:text-stone-900 hover:bg-stone-100 flex items-center gap-1"
            title="Open research chart guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            Guide
          </button>
        </div>
      </div>

      {/* Traits List (Grouped or Filtered) */}
      <div className="space-y-3">
        {filteredTraits.map((trait, idx) => (
          <TraitCard
            key={trait.id}
            trait={trait}
            score={traitScores[trait.id]}
            onScoreChange={(val) => handleScoreChange(trait.id, val)}
            onClearScore={() => handleClearScore(trait.id)}
            index={idx}
          />
        ))}
      </div>

      {/* Final Production Profile Discrete Selection Category */}
      <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border-2 border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Final Production Profile Category
              </h3>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Holistic classification of where the animal falls across all traits (Discrete choice: PP3, PP2-, PP2+, PP1).
            </p>
          </div>
          {finalProductionCategory && (
            <button
              type="button"
              onClick={() => setFinalProductionCategory(undefined)}
              className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              Clear Choice
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {PRODUCTION_PROFILES.map((profile) => {
            const isSelected = finalProductionCategory === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => setFinalProductionCategory(profile.id)}
                className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? profile.selectedClass
                    : `bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 ${profile.badgeColor}`
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-lg font-black">{profile.label}</span>
                  {isSelected && <CheckCircle className="w-4 h-4" />}
                </div>
                <span className={`text-[11px] font-medium leading-tight ${isSelected ? 'text-white/90' : 'text-stone-500 dark:text-stone-400'}`}>
                  {profile.sublabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Assessor Notes Field */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
          Veterinarian Clinical Observations & Notes
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Excellent muscularity across loin; slight hoof angle defect; research batch 2..."
          className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
        />
      </div>

      {/* Spacer for bottom action footer clearance */}
      <div className="h-28 sm:h-24 w-full" aria-hidden="true" />

      {/* Fixed / Floating Action Footer for Quick Field Scoring with iOS Safe Area support */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 p-3 sm:p-4 shadow-xl"
        style={{
          paddingBottom: 'max(0.75rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))',
        }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Quick Summary Pill on Mobile & Desktop (No averages) */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 block truncate">
                Cow: <span className="text-stone-900 dark:text-stone-100">{cowId || 'Untitled'}</span>
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  {scoredCount}/{totalTraitsCount} scored
                </span>
                {finalProductionCategory && (
                  <>
                    <span className="text-stone-300 dark:text-stone-700">|</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      PP: {finalProductionCategory}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Category trait count badges */}
            <div className="hidden md:flex items-center gap-1.5">
              {categoryStats.map((c) => (
                <div
                  key={c.id}
                  className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] font-medium text-stone-700 dark:text-stone-300"
                >
                  {c.shortName}: <span className="font-bold">{c.scored}/{c.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs sm:text-sm hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Record</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-md transition-transform active:scale-95"
            >
              <span>Save & Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Fields Management Modal */}
      <DynamicFieldEditorModal
        isOpen={isFieldEditorOpen}
        onClose={() => setIsFieldEditorOpen(false)}
        fields={dynamicFields}
        onSaveFields={onUpdateDynamicFields}
      />
    </div>
  );
};
