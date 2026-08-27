import React, { useState } from 'react';
import { DynamicFieldDefinition, FieldType } from '../types';
import { Plus, Trash2, X, Settings2, Check, ArrowDown, ArrowUp } from 'lucide-react';

interface DynamicFieldEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: DynamicFieldDefinition[];
  onSaveFields: (newFields: DynamicFieldDefinition[]) => void;
}

export const DynamicFieldEditorModal: React.FC<DynamicFieldEditorModalProps> = ({
  isOpen,
  onClose,
  fields,
  onSaveFields,
}) => {
  const [localFields, setLocalFields] = useState<DynamicFieldDefinition[]>(fields);
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<FieldType>('text');
  const [newUnit, setNewUnit] = useState('');
  const [newPlaceholder, setNewPlaceholder] = useState('');

  if (!isOpen) return null;

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const id = `custom_${Date.now()}_${newLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const created: DynamicFieldDefinition = {
      id,
      label: newLabel.trim(),
      type: newType,
      unit: newUnit.trim() || undefined,
      placeholder: newPlaceholder.trim() || undefined,
      enabled: true,
    };

    setLocalFields([...localFields, created]);
    setNewLabel('');
    setNewUnit('');
    setNewPlaceholder('');
  };

  const handleToggleField = (id: string) => {
    setLocalFields(
      localFields.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const handleDeleteField = (id: string) => {
    setLocalFields(localFields.filter((f) => f.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= localFields.length) return;
    const copy = [...localFields];
    const item = copy.splice(index, 1)[0];
    copy.splice(targetIdx, 0, item);
    setLocalFields(copy);
  };

  const handleSave = () => {
    onSaveFields(localFields);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Manage Dynamic Record Fields
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Add, delete, or reorder dynamic metadata (Cow ID is permanent).
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

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Permanent Cow ID note */}
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Core Primary Key
              </span>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Cow ID (Ear tag / Barcode / Tattoo)
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-md">
              Required
            </span>
          </div>

          {/* Current Dynamic Fields List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Configured Dynamic Fields ({localFields.length})
            </h3>
            {localFields.length === 0 ? (
              <p className="text-sm text-stone-500 italic p-3 text-center border border-dashed rounded-xl border-stone-300 dark:border-stone-700">
                No optional metadata fields. Only Cow ID and trait scores will be gathered.
              </p>
            ) : (
              localFields.map((field, idx) => (
                <div
                  key={field.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                    field.enabled
                      ? 'bg-white dark:bg-stone-800/50 border-stone-200 dark:border-stone-700'
                      : 'bg-stone-50 dark:bg-stone-900/40 border-dashed border-stone-300 dark:border-stone-800 opacity-60'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-stone-900 dark:text-stone-100 truncate">
                        {field.label}
                      </span>
                      {field.unit && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                          {field.unit}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-stone-500 dark:text-stone-400 capitalize">
                      Type: {field.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === localFields.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleField(field.id)}
                      className={`px-2 py-1 text-xs rounded-md font-medium ${
                        field.enabled
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                      }`}
                    >
                      {field.enabled ? 'Active' : 'Disabled'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteField(field.id)}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md"
                      title="Delete field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add New Custom Field Form */}
          <form onSubmit={handleAddField} className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/30 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              Add Dynamic Field
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Field Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pen Number / Dam ID"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Data Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as FieldType)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                >
                  <option value="text">Text (e.g. Breed, Pasture)</option>
                  <option value="number">Number (e.g. Weight, Body Temp)</option>
                  <option value="date">Date (e.g. Calving date)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Unit (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. kg, lbs, cm"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Placeholder (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Enter tag..."
                  value={newPlaceholder}
                  onChange={(e) => setNewPlaceholder(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!newLabel.trim()}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 disabled:opacity-40 transition-colors"
            >
              Add Field to Template
            </button>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2 bg-stone-50 dark:bg-stone-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-4 h-4" />
            Apply Field Changes
          </button>
        </div>
      </div>
    </div>
  );
};
