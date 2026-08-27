import React from 'react';
import {
  ClipboardCheck,
  Database,
  Sliders,
  BookOpen,
  Settings2,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'grade' | 'records' | 'guide';
  onSelectTab: (tab: 'grade' | 'records' | 'guide') => void;
  recordsCount: number;
  onOpenFieldEditor: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  recordsCount,
  onOpenFieldEditor,
}) => {
  return (
    <header
      className="sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800"
      style={{
        paddingTop: 'max(0.6rem, env(safe-area-inset-top, 0px))',
      }}
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        {/* Top Tier: Brand & Utility Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand & App Title */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shrink-0 shadow-xs">
              <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 tracking-tight leading-none">
                BovineGrade
              </h1>
              <p className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 font-medium truncate mt-0.5">
                Cattle Trait Assessor (1-10)
              </p>
            </div>
          </div>

          {/* Quick Utility Actions (Guide + Dynamic Field Settings) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onSelectTab('guide')}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all flex items-center gap-1"
              title="Open Reference Guide"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden xs:inline">Guide</span>
            </button>

            <button
              type="button"
              onClick={onOpenFieldEditor}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all flex items-center gap-1"
              title="Configure Dynamic Record Fields"
            >
              <Settings2 className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              <span className="hidden sm:inline">Fields</span>
            </button>
          </div>
        </div>

        {/* Bottom Tier: Primary Segmented Navigation Tabs */}
        <div className="mt-2 grid grid-cols-2 gap-1.5 bg-stone-100 dark:bg-stone-800/90 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onSelectTab('grade')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'grade'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Grade Cattle</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('records')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'records'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Records</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold ml-0.5">
              {recordsCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

