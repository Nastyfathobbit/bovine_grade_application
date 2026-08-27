import React, { useState } from 'react';
import { TRAIT_DEFINITIONS } from '../data/traitDefinitions';
import { BookOpen, Search, X, CheckCircle2, ChevronDown } from 'lucide-react';

interface ReferenceGuideProps {
  onClose: () => void;
}

export const ReferenceGuide: React.FC<ReferenceGuideProps> = ({ onClose }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'muscle' | 'skeletal' | 'capacity'>('all');

  const filteredTraits = TRAIT_DEFINITIONS.filter((t) => {
    if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false;
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      t.anatomicSite.toLowerCase().includes(q) ||
      t.traitName.toLowerCase().includes(q) ||
      t.pp3Label.toLowerCase().includes(q) ||
      t.pp1Label.toLowerCase().includes(q) ||
      (t.anatomicNotes && t.anatomicNotes.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/60 dark:bg-stone-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Production Potential (PP) Classification Guide
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Extremity descriptions mapping (Score 1 = PP3, Score 10 = PP1).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter controls */}
        <div className="p-3.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-900/50 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search anatomic site or trait..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="flex items-center gap-1 text-xs overflow-x-auto">
            {(['all', 'muscle', 'skeletal', 'capacity'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                }`}
              >
                {cat === 'all' ? 'All (34)' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <div className="space-y-2">
            {filteredTraits.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/40 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {t.anatomicSite} — {t.traitName}
                    </span>
                    {t.anatomicNotes && (
                      <span className="block text-stone-500 dark:text-stone-400 italic text-[11px]">
                        {t.anatomicNotes}
                      </span>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase">
                    {t.categoryId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100 dark:border-stone-800">
                  <div className="p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50">
                    <span className="block text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400">
                      Score 1 (PP3 Extremity)
                    </span>
                    <span className="font-semibold text-rose-900 dark:text-rose-200">
                      {t.pp3Label}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-right">
                    <span className="block text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                      Score 10 (PP1 Extremity)
                    </span>
                    <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                      {t.pp1Label}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
