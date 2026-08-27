import { CowRecord, DynamicFieldDefinition } from '../types';
import { TRAIT_DEFINITIONS } from '../data/traitDefinitions';
import { DEFAULT_DYNAMIC_FIELDS } from '../data/defaultFields';

const RECORDS_STORAGE_KEY = 'bovinegrade_records_v1';
const DYNAMIC_FIELDS_STORAGE_KEY = 'bovinegrade_fields_v1';
const DRAFT_STORAGE_KEY = 'bovinegrade_active_draft_v1';

export function getStoredRecords(): CowRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!raw) return getInitialDemoRecords();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load records from storage', err);
    return [];
  }
}

export function saveStoredRecords(records: CowRecord[]): void {
  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save records to storage', err);
  }
}

export function getStoredDynamicFields(): DynamicFieldDefinition[] {
  try {
    const raw = localStorage.getItem(DYNAMIC_FIELDS_STORAGE_KEY);
    if (!raw) return DEFAULT_DYNAMIC_FIELDS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_DYNAMIC_FIELDS;
  } catch (err) {
    console.error('Failed to load dynamic fields from storage', err);
    return DEFAULT_DYNAMIC_FIELDS;
  }
}

export function saveStoredDynamicFields(fields: DynamicFieldDefinition[]): void {
  try {
    localStorage.setItem(DYNAMIC_FIELDS_STORAGE_KEY, JSON.stringify(fields));
  } catch (err) {
    console.error('Failed to save dynamic fields to storage', err);
  }
}

export function getStoredDraft(): Partial<CowRecord> | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredDraft(draft: Partial<CowRecord>): void {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch (err) {
    console.error('Failed to save draft to storage', err);
  }
}

export function clearStoredDraft(): void {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
}

// Convert all records to research-grade CSV
export function exportRecordsToCSV(
  records: CowRecord[],
  fields: DynamicFieldDefinition[]
): string {
  const activeFields = fields.filter((f) => f.enabled);

  // Build CSV Header (clean research structure without averages)
  const headers = [
    'Record_UUID',
    'Cow_ID',
    'Final_Production_Profile',
    'Timestamp',
    'Assessor_Name',
    'Assessment_Date_Formatted',
    ...activeFields.map((f) => `Meta_${f.label.replace(/\s+/g, '_')}${f.unit ? `_(${f.unit})` : ''}`),
    ...TRAIT_DEFINITIONS.map(
      (t) =>
        `Trait_${t.categoryId.toUpperCase()}_${t.anatomicSite.replace(/[^a-zA-Z0-9]/g, '_')}_${t.traitName.replace(/[^a-zA-Z0-9]/g, '_')}`
    ),
    'Notes',
  ];

  const rows = records.map((rec) => {
    const traitScores = rec.traitScores || {};

    const rowData = [
      rec.id,
      escapeCSV(rec.cowId),
      escapeCSV(rec.finalProductionCategory || ''),
      rec.timestamp,
      escapeCSV(rec.assessorName || ''),
      new Date(rec.timestamp).toISOString().split('T')[0],
      ...activeFields.map((f) => escapeCSV(String(rec.dynamicValues?.[f.id] ?? ''))),
      ...TRAIT_DEFINITIONS.map((t) => (traitScores[t.id] !== undefined ? traitScores[t.id] : '')),
      escapeCSV(rec.notes || ''),
    ];

    return rowData.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

function escapeCSV(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getInitialDemoRecords(): CowRecord[] {
  return [
    {
      id: 'demo-cow-1',
      cowId: 'B-8802',
      finalProductionCategory: 'PP1',
      timestamp: Date.now() - 86400000 * 2,
      assessorName: 'Dr. Van Der Merwe, DVM',
      dynamicValues: {
        classification_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        cow_weight: 620,
        approximate_age: '4.5 years',
      },
      traitScores: {
        shoulder_convexity: 9,
        shoulder_muscularity: 8,
        forearm_v_shape: 8,
        forearm_ratio_diameter: 9,
        forearm_circumference: 8,
        lumbodorsal_convexity: 9,
        loin_muscularity: 8,
        rump_convexity: 9,
        buttocks_convexity: 9,
        neck_muscularity: 7,
        cannon_bone_length: 6,
        cannon_bone_circumference: 8,
        hock_joint_circumference: 8,
        body_length_skeletal: 8,
        hip_height: 7,
        spring_of_rib: 8,
        hip_tuber_coxae_width: 9,
        withers_height: 7,
        stifle_width: 8,
        chest_width: 9,
        neck_length: 7,
        rump_tuber_length: 8,
        pins_tuber_ishii_width: 8,
        head_length: 7,
        head_width: 8,
        head_ratio: 8,
        rib_cage_volume: 9,
        rib_cage_shape: 8,
        rib_cage_depth: 9,
        body_capacity_overall: 9,
        general_muscularity: 9,
        general_shape: 8,
        general_thickness: 8,
        hindquarter_volume: 9,
      },
      notes: 'Exceptional beef conformation with outstanding rib spring and rear muscularity.',
    },
    {
      id: 'demo-cow-2',
      cowId: 'SA-4019',
      finalProductionCategory: 'PP2+',
      timestamp: Date.now() - 86400000,
      assessorName: 'Dr. Van Der Merwe, DVM',
      dynamicValues: {
        classification_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        cow_weight: 485,
        approximate_age: '2.8 years',
      },
      traitScores: {
        shoulder_convexity: 5,
        shoulder_muscularity: 4,
        forearm_v_shape: 5,
        forearm_ratio_diameter: 4,
        forearm_circumference: 4,
        lumbodorsal_convexity: 5,
        loin_muscularity: 4,
        rump_convexity: 4,
        buttocks_convexity: 4,
        neck_muscularity: 5,
        cannon_bone_length: 5,
        cannon_bone_circumference: 4,
        hock_joint_circumference: 5,
        body_length_skeletal: 6,
        hip_height: 5,
        spring_of_rib: 5,
        hip_tuber_coxae_width: 5,
        withers_height: 5,
        stifle_width: 5,
        chest_width: 5,
        neck_length: 6,
        rump_tuber_length: 5,
        pins_tuber_ishii_width: 4,
        head_length: 6,
        head_width: 5,
        head_ratio: 5,
        rib_cage_volume: 5,
        rib_cage_shape: 5,
        rib_cage_depth: 5,
        body_capacity_overall: 5,
        general_muscularity: 4,
        general_shape: 5,
        general_thickness: 4,
        hindquarter_volume: 4,
      },
      notes: 'Moderate frame, resilient pasture breed. Intermediate muscle scoring.',
    },
  ];
}
