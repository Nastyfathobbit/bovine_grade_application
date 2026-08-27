import React, { useState, useEffect } from 'react';
import { CowRecord, DynamicFieldDefinition } from './types';
import {
  getStoredRecords,
  saveStoredRecords,
  getStoredDynamicFields,
  saveStoredDynamicFields,
} from './utils/storage';
import { Header } from './components/Header';
import { AssessmentForm } from './components/AssessmentForm';
import { RecordsList } from './components/RecordsList';
import { RecordDetailModal } from './components/RecordDetailModal';
import { ReferenceGuide } from './components/ReferenceGuide';
import { DynamicFieldEditorModal } from './components/DynamicFieldEditorModal';
import { CheckCircle, Sliders, Database, BookOpen } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<CowRecord[]>([]);
  const [dynamicFields, setDynamicFields] = useState<DynamicFieldDefinition[]>([]);
  const [activeTab, setActiveTab] = useState<'grade' | 'records' | 'guide'>('grade');
  const [editingRecord, setEditingRecord] = useState<CowRecord | null>(null);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<CowRecord | null>(null);
  const [isReferenceGuideOpen, setIsReferenceGuideOpen] = useState(false);
  const [isFieldEditorOpen, setIsFieldEditorOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize from storage
  useEffect(() => {
    const loadedRecords = getStoredRecords();
    const loadedFields = getStoredDynamicFields();
    setRecords(loadedRecords);
    setDynamicFields(loadedFields);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  const handleSaveRecord = (record: CowRecord, shouldNext: boolean) => {
    const existingIndex = records.findIndex((r) => r.id === record.id);
    let updated: CowRecord[];
    if (existingIndex >= 0) {
      updated = [...records];
      updated[existingIndex] = record;
      showToast(`Updated record for Cow ${record.cowId}`);
    } else {
      updated = [record, ...records];
      showToast(`Saved record for Cow ${record.cowId}`);
    }

    setRecords(updated);
    saveStoredRecords(updated);
    setEditingRecord(null);

    if (!shouldNext) {
      // If user clicked "Save Record", switch to records view or keep form
      setActiveTab('records');
    }
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    saveStoredRecords(updated);
    showToast('Cattle record deleted');
  };

  const handleUpdateDynamicFields = (newFields: DynamicFieldDefinition[]) => {
    setDynamicFields(newFields);
    saveStoredDynamicFields(newFields);
    showToast('Record field configuration updated');
  };

  const handleImportRecords = (imported: CowRecord[]) => {
    // Merge without duplicates by id
    const existingIds = new Set(records.map((r) => r.id));
    const toAdd = imported.filter((r) => !existingIds.has(r.id));
    const combined = [...toAdd, ...records];
    setRecords(combined);
    saveStoredRecords(combined);
    showToast(`Imported ${toAdd.length} cattle entries`);
  };

  const handleEditFromList = (record: CowRecord) => {
    setEditingRecord(record);
    setActiveTab('grade');
  };

  const handleStartNewCow = () => {
    setEditingRecord(null);
    setActiveTab('grade');
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-emerald-200">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'guide') {
            setIsReferenceGuideOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        recordsCount={records.length}
        onOpenFieldEditor={() => setIsFieldEditorOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-4 md:p-6 overflow-x-hidden">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className="fixed right-3 sm:right-4 z-50 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              top: 'max(4.5rem, calc(env(safe-area-inset-top, 0px) + 3.5rem))',
            }}
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'grade' && (
          <AssessmentForm
            initialRecord={editingRecord}
            dynamicFields={dynamicFields}
            onSaveRecord={handleSaveRecord}
            onUpdateDynamicFields={handleUpdateDynamicFields}
            onOpenReferenceGuide={() => setIsReferenceGuideOpen(true)}
          />
        )}

        {activeTab === 'records' && (
          <RecordsList
            records={records}
            dynamicFields={dynamicFields}
            onSelectRecord={(rec) => setSelectedRecordForDetail(rec)}
            onEditRecord={handleEditFromList}
            onDeleteRecord={handleDeleteRecord}
            onNewRecord={handleStartNewCow}
            onImportRecords={handleImportRecords}
          />
        )}
      </main>

      {/* Record Detail Modal */}
      <RecordDetailModal
        record={selectedRecordForDetail}
        onClose={() => setSelectedRecordForDetail(null)}
        dynamicFields={dynamicFields}
        onEditRecord={handleEditFromList}
      />

      {/* Reference Guide Modal */}
      {isReferenceGuideOpen && (
        <ReferenceGuide onClose={() => setIsReferenceGuideOpen(false)} />
      )}

      {/* Dynamic Fields Settings Modal */}
      <DynamicFieldEditorModal
        isOpen={isFieldEditorOpen}
        onClose={() => setIsFieldEditorOpen(false)}
        fields={dynamicFields}
        onSaveFields={handleUpdateDynamicFields}
      />
    </div>
  );
}
