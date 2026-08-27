import React from 'react';
import { CowRecord, DynamicFieldDefinition, ProductionProfileCategory } from '../types';
import { TRAIT_DEFINITIONS, CATEGORIES_CONFIG } from '../data/traitDefinitions';
import { downloadFile } from '../utils/storage';
import {
  X,
  Download,
  Calendar,
  Tag,
  CheckCircle2,
  Share2,
  FileText,
  Activity,
  Layers,
  Award,
} from 'lucide-react';

interface RecordDetailModalProps {
  record: CowRecord | null;
  onClose: () => void;
  dynamicFields: DynamicFieldDefinition[];
  onEditRecord: (record: CowRecord) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  onClose,
  dynamicFields,
  onEditRecord,
}) => {
  if (!record) return null;

  const traitScores = record.traitScores || {};

  // Group traits by category with count statistics (No averages)
  const categoryData = CATEGORIES_CONFIG.map((cat) => {
    const traits = TRAIT_DEFINITIONS.filter((t) => t.categoryId === cat.id);
    const scoredTraits = traits.filter((t) => traitScores[t.id] !== undefined);

    return {
      ...cat,
      traits,
      scoredCount: scoredTraits.length,
    };
  });

  const scoredCount = Object.values(traitScores).filter(
    (s): s is number => typeof s === 'number'
  ).length;

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(record, null, 2);
    downloadFile(jsonStr, `cattle_record_${record.cowId}.json`, 'application/json');
  };

  const getScorePillColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300';
    if (score >= 6) return 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300';
    if (score >= 4) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300';
    return 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300';
  };

  const getProfileBadgeStyle = (category?: ProductionProfileCategory) => {
    switch (category) {
      case 'PP1':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700';
      case 'PP2+':
        return 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-700';
      case 'PP2-':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700';
      case 'PP3':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700';
      default:
        return 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-stone-900 dark:text-stone-100">
                  {record.cowId}
                </h2>
                {record.finalProductionCategory ? (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-md font-bold border ${getProfileBadgeStyle(
                      record.finalProductionCategory
                    )}`}
                  >
                    Profile: {record.finalProductionCategory}
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 font-semibold">
                    No PP Assigned
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Assessed on {new Date(record.timestamp).toLocaleDateString()}
                {record.assessorName && ` by ${record.assessorName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExportJSON}
              className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold flex items-center gap-1"
              title="Download JSON Data Object"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">JSON</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Summary Metric Cards (Category Scored Counts & Final PP) */}
          <div className="grid grid-cols-3 gap-2">
            {categoryData.map((cat) => (
              <div
                key={cat.id}
                className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 text-center"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block truncate">
                  {cat.shortName}
                </span>
                <span className="text-xl font-black text-stone-900 dark:text-stone-100 block my-0.5">
                  {cat.scoredCount}/{cat.traits.length}
                </span>
                <span className="text-[10px] text-stone-400 block">
                  {cat.scoredCount === cat.traits.length ? 'Completed' : `${cat.traits.length - cat.scoredCount} Unscored`}
                </span>
              </div>
            ))}
          </div>

          {/* Dynamic Metadata Attributes */}
          {dynamicFields.filter((f) => f.enabled).length > 0 && (
            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                Recorded Animal Information
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {dynamicFields
                  .filter((f) => f.enabled)
                  .map((f) => {
                    const val = record.dynamicValues?.[f.id];
                    return (
                      <div key={f.id} className="p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                          {f.label}
                        </span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {val !== undefined && val !== '' ? `${val} ${f.unit || ''}` : '--'}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Clinical Notes */}
          {record.notes && (
            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                Clinical Observations
              </span>
              <p className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                {record.notes}
              </p>
            </div>
          )}

          {/* Detailed Traits Table by Category */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Complete Trait Breakdown (1-10 Scale)
            </h3>

            {categoryData.map((cat) => (
              <div
                key={cat.id}
                className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden"
              >
                <div className="bg-stone-100 dark:bg-stone-800/80 px-3 py-2 flex items-center justify-between border-b border-stone-200 dark:border-stone-700">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {cat.name}
                  </span>
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                    {cat.scoredCount}/{cat.traits.length} Scored
                  </span>
                </div>

                <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                  {cat.traits.map((t) => {
                    const score = traitScores[t.id];
                    return (
                      <div
                        key={t.id}
                        className="p-2.5 flex items-center justify-between gap-3 hover:bg-stone-50/50 dark:hover:bg-stone-800/30"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-stone-900 dark:text-stone-100">
                              {t.anatomicSite} - {t.traitName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                            <span>1 (PP3): {t.pp3Label}</span>
                            <span>•</span>
                            <span>10 (PP1): {t.pp1Label}</span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {score !== undefined ? (
                            <span
                              className={`inline-block px-2.5 py-1 rounded-lg font-bold text-xs ${getScorePillColor(
                                score
                              )}`}
                            >
                              Score: {score}
                            </span>
                          ) : (
                            <span className="text-stone-400 text-xs italic">Unscored</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onEditRecord(record);
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100"
          >
            Edit Record in Form
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
