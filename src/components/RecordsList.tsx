import React, { useState, useMemo } from 'react';
import { CowRecord, DynamicFieldDefinition, ProductionProfileCategory } from '../types';
import { exportRecordsToCSV, downloadFile } from '../utils/storage';
import { TRAIT_DEFINITIONS } from '../data/traitDefinitions';
import {
  Search,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  FileSpreadsheet,
  Plus,
  Award,
  CheckCircle2,
  ListFilter,
} from 'lucide-react';

interface RecordsListProps {
  records: CowRecord[];
  dynamicFields: DynamicFieldDefinition[];
  onSelectRecord: (record: CowRecord) => void;
  onEditRecord: (record: CowRecord) => void;
  onDeleteRecord: (id: string) => void;
  onNewRecord: () => void;
  onImportRecords: (records: CowRecord[]) => void;
}

export const RecordsList: React.FC<RecordsListProps> = ({
  records,
  dynamicFields,
  onSelectRecord,
  onEditRecord,
  onDeleteRecord,
  onNewRecord,
  onImportRecords,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'id' | 'most_scored' | 'pp_category'>('date_desc');

  // Compute profile distributions across all records (No averages)
  const stats = useMemo(() => {
    const total = records.length;
    let completedCount = 0;
    const profileCounts: Record<ProductionProfileCategory, number> = {
      PP3: 0,
      'PP2-': 0,
      'PP2+': 0,
      PP1: 0,
    };

    records.forEach((rec) => {
      const scoredTraits = Object.keys(rec.traitScores || {}).length;
      if (scoredTraits >= TRAIT_DEFINITIONS.length) {
        completedCount++;
      }
      if (rec.finalProductionCategory && profileCounts[rec.finalProductionCategory] !== undefined) {
        profileCounts[rec.finalProductionCategory]++;
      }
    });

    return {
      total,
      completedCount,
      profileCounts,
    };
  }, [records]);

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    const list = records.filter((r) => {
      if (!q) return true;
      if (r.cowId.toLowerCase().includes(q)) return true;
      if (r.notes && r.notes.toLowerCase().includes(q)) return true;
      if (r.assessorName && r.assessorName.toLowerCase().includes(q)) return true;
      if (r.finalProductionCategory && r.finalProductionCategory.toLowerCase().includes(q)) return true;
      return Object.values(r.dynamicValues || {}).some((v) =>
        String(v).toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      if (sortBy === 'date_desc') return b.timestamp - a.timestamp;
      if (sortBy === 'date_asc') return a.timestamp - b.timestamp;
      if (sortBy === 'id') return a.cowId.localeCompare(b.cowId);

      if (sortBy === 'most_scored') {
        const aCount = Object.keys(a.traitScores || {}).length;
        const bCount = Object.keys(b.traitScores || {}).length;
        return bCount - aCount;
      }

      if (sortBy === 'pp_category') {
        const order: Record<string, number> = { PP1: 4, 'PP2+': 3, 'PP2-': 2, PP3: 1 };
        const aVal = a.finalProductionCategory ? order[a.finalProductionCategory] || 0 : 0;
        const bVal = b.finalProductionCategory ? order[b.finalProductionCategory] || 0 : 0;
        return bVal - aVal;
      }

      return 0;
    });

    return list;
  }, [records, searchTerm, sortBy]);

  const handleExportCSV = () => {
    if (!records.length) return;
    const csvData = exportRecordsToCSV(records, dynamicFields);
    downloadFile(
      csvData,
      `cattle_research_data_${new Date().toISOString().split('T')[0]}.csv`,
      'text/csv'
    );
  };

  const handleExportJSON = () => {
    if (!records.length) return;
    const jsonStr = JSON.stringify(records, null, 2);
    downloadFile(
      jsonStr,
      `cattle_research_backup_${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          onImportRecords(parsed);
          alert(`Successfully imported ${parsed.length} cattle records.`);
        } else if (parsed && parsed.cowId) {
          onImportRecords([parsed]);
          alert('Successfully imported 1 cattle record.');
        }
      } catch {
        alert('Failed to parse JSON file. Please ensure valid format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
    <div className="space-y-4">
      {/* Top Metric & Production Profile Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
            Graded Cattle
          </span>
          <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {stats.total}
          </span>
          <span className="text-[10px] text-stone-400 block mt-0.5">Total recorded animals</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Fully Scored (34 Traits)
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.completedCount}
          </span>
          <span className="text-[10px] text-stone-400 block mt-0.5">Complete research records</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
            High Profile (PP1 / PP2+)
          </span>
          <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {stats.profileCounts.PP1 + stats.profileCounts['PP2+']}
          </span>
          <span className="text-[10px] text-stone-400 block mt-0.5">
            PP1: {stats.profileCounts.PP1} | PP2+: {stats.profileCounts['PP2+']}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
            Low Profile (PP2- / PP3)
          </span>
          <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {stats.profileCounts['PP2-'] + stats.profileCounts.PP3}
          </span>
          <span className="text-[10px] text-stone-400 block mt-0.5">
            PP2-: {stats.profileCounts['PP2-']} | PP3: {stats.profileCounts.PP3}
          </span>
        </div>
      </div>

      {/* Control Bar: Search, Sort, Import/Export, New Record */}
      <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Cow ID, Assessor, notes, PP grade..."
              className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Selector & New Record */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 sm:flex-initial text-xs font-semibold px-2.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="id">Cow ID (A-Z)</option>
              <option value="pp_category">Production Profile (PP1 to PP3)</option>
              <option value="most_scored">Most Scored Traits</option>
            </select>

            <button
              type="button"
              onClick={onNewRecord}
              className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Grade New Cow</span>
            </button>
          </div>
        </div>

        {/* Export & Import Row */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 flex-wrap gap-2 text-xs">
          <span className="text-stone-500 dark:text-stone-400 font-medium">
            Showing {filteredRecords.length} of {records.length} records
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={!records.length}
              className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium flex items-center gap-1 disabled:opacity-40"
              title="Export all data to research spreadsheet CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              disabled={!records.length}
              className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium flex items-center gap-1 disabled:opacity-40"
              title="Backup JSON data objects"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON Backup</span>
            </button>

            <label className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium flex items-center gap-1 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Cattle Records List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
            No cattle records found
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchTerm
              ? `No records matching "${searchTerm}". Try a different search term.`
              : 'Begin scoring your herd with the 1-10 snapping slider assessment form.'}
          </p>
          <button
            type="button"
            onClick={onNewRecord}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Grade First Cow
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredRecords.map((rec) => {
            const traitVals = Object.values(rec.traitScores || {}).filter(
              (v): v is number => typeof v === 'number'
            );
            const scoredCount = traitVals.length;

            return (
              <div
                key={rec.id}
                className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Top row: Cow ID and Final PP Category Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        {rec.cowId}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex-wrap">
                        <span>{new Date(rec.timestamp).toLocaleDateString()}</span>
                        {rec.dynamicValues?.cow_weight && (
                          <>
                            <span>•</span>
                            <span>{rec.dynamicValues.cow_weight} kg</span>
                          </>
                        )}
                        {rec.dynamicValues?.approximate_age && (
                          <>
                            <span>•</span>
                            <span>{rec.dynamicValues.approximate_age}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {rec.finalProductionCategory ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-black text-xs border ${getProfileBadgeStyle(
                            rec.finalProductionCategory
                          )}`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          {rec.finalProductionCategory}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 text-[11px] font-semibold">
                          No PP Set
                        </span>
                      )}
                      <span className="block text-[10px] text-stone-400 mt-0.5">
                        {scoredCount}/{TRAIT_DEFINITIONS.length} traits
                      </span>
                    </div>
                  </div>

                  {/* Notes snippet if present */}
                  {rec.notes && (
                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1 italic mt-2 bg-stone-50 dark:bg-stone-800/40 p-1.5 rounded-lg">
                      "{rec.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Action Strip */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                  <button
                    type="button"
                    onClick={() => onSelectRecord(rec)}
                    className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Traits</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditRecord(rec)}
                      className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
                      title="Edit assessment"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete record for Cow ${rec.cowId}?`)) {
                          onDeleteRecord(rec.id);
                        }
                      }}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
